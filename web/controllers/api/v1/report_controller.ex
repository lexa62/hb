defmodule Hb.ReportController do
  use Hb.Web, :controller
  use Filterable.Phoenix.Controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Transaction, User, Category}

  filterable do
    @options cast: :date
    filter from(query, value, _conn) do
      datetime = NaiveDateTime.new(value.year, value.month, value.day, 0, 0, 0)
        |> elem(1)
        |> DateTime.from_naive!("Etc/UTC")
      query |> where([t], t.exec_at >= ^datetime)
    end

    @options cast: :date
    filter to(query, value, _conn) do
      datetime = NaiveDateTime.new(value.year, value.month, value.day, 0, 0, 0)
        |> elem(1)
        |> DateTime.from_naive!("Etc/UTC")
      query |> where([t], t.exec_at < ^datetime)
    end
  end

  def index(conn, params) do
    current_user = Guardian.Plug.current_resource(conn)

    transactions = current_user
      |> assoc(:all_accounting)
      |> Repo.get(params["accounting_id"])
      |> assoc(:transactions)
      |> apply_filters!(conn)
      |> elem(0)
      |> Transaction.preload_all
      |> Repo.all

    IO.inspect params

    if false do
      category_tree = %{}
      grouped_transactions = transactions |> Enum.group_by(&(&1.category))
      categories = grouped_transactions |> Map.keys
      roots = categories |> Enum.filter(&(&1.parent_id == nil))

      category_tree = roots
        |> Enum.reduce(category_tree, fn(t, acc) ->
          acc = Map.put(acc, t, %{})
          # put_in(acc, [t], t)
        end)

      add_to = fn(parent, tree, keys, fun) ->
        categories
          |> Enum.filter(&(&1.parent_id == parent.id))
          |> Enum.reduce(tree, fn(c, acc) ->
            keys = keys ++ [c]
            # IEx.pry
            acc = Map.merge(acc, fun.(c, acc, keys, fun))
            res = Service.MiscScripts.initialized_map(acc, keys)
            # IEx.pry
            # put_in(res, keys ++ [:node], c)
          end)
      end

      # IEx.pry
      category_tree = roots
        |> Enum.reduce(category_tree, fn(r, acc) ->
          res_map = add_to.(r, acc, [r], add_to)
          acc = Map.merge(acc, res_map)
          acc
        end)

      go_down = fn(tree, keys, fun) ->
        subtree = get_in(tree, keys)
        subcategories = subtree |> Map.keys
        case subcategories do
          [] ->
            category = categories |> Enum.find(&(&1 == List.last(keys)))
            sum = grouped_transactions[category]
              |> Enum.reduce(Money.new(0), fn(t, acc) ->
                case t.category.type do
                  :expense ->
                    Money.subtract(acc, t.amount)
                  :income ->
                    Money.add(acc, t.amount)
                  _ ->
                    acc
                 end
              end)
            {put_in(tree, keys ++ [:sum], sum), sum}
          _ ->
            {tree, sum} = subcategories
              |> Enum.reduce({tree, Money.new(0)}, fn(k, acc) ->
                {tree, sum} = fun.(elem(acc, 0), keys ++ [k], fun)
                {Map.merge(elem(acc, 0), tree), Money.add(elem(acc, 1), sum)}
              end)
            {put_in(tree, keys ++ [:sum], sum), sum}
        end
      end

      res_tree = category_tree
        |> Map.keys
        |> Enum.reduce(category_tree, fn(key, acc) ->
          {tree, sum} = go_down.(acc, [key], go_down)
          Map.merge(acc, tree)
        end)
    end

    render(conn, "report.json", transactions: transactions, category_tree: res_tree)
  end

end
