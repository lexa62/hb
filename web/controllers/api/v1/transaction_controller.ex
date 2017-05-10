require IEx;
defmodule Hb.TransactionController do
  use Hb.Web, :controller
  use Filterable.Phoenix.Controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Transaction, User}


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

  def export(conn, %{"accounting_id" => accounting_id}) do
    current_user = Guardian.Plug.current_resource(conn)

    transactions = current_user
      |> assoc(:all_accounting)
      |> Repo.get(accounting_id)
      |> assoc(:transactions)
      |> Repo.all

    csv_content = TransactionsCsvSerializer.to_csv_string(transactions)

    render(conn, "export.json", content: csv_content)
  end

  def import(conn, %{"accounting_id" => accounting_id, "file" => file}) do
    current_user = Guardian.Plug.current_resource(conn)

    if file do
      IO.inspect extension = Path.extname(file.filename)
      IO.inspect File.stat(file.path)
    end

    result = TransactionsCsvSerializer.parse_and_save(file.path, accounting_id, current_user.id)

    render(conn, "import.json", result: result)
  end

  def report(conn, params) do
    current_user = Guardian.Plug.current_resource(conn)

    transactions = current_user
      |> assoc(:all_accounting)
      |> Repo.get(params["accounting_id"])
      |> assoc(:transactions)
      |> apply_filters!(conn)
      |> elem(0)
      |> Repo.all
      |> Repo.preload(:category)

    IO.inspect params

    if true do
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
            res = initialized_map(acc, keys)
            # IEx.pry
            # put_in(res, keys ++ [:node], c)
          end)
      end

      # IEx.pry
      category_tree = roots
        |> Enum.reduce(category_tree, fn(r, acc) ->
          res_map = add_to.(r, acc, [r], add_to)
          # IEx.pry
          acc = Map.merge(acc, res_map)
          acc
        end)
      # IEx.pry
      # IO.inspect category_tree

      go_down = fn(tree, keys, fun) ->
        subtree = get_in(tree, keys)
        subcategories = subtree |> Map.keys
        case subcategories do
          [] ->
            # IEx.pry
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
              # |> Enum.filter(&(&1 != :node))
              |> Enum.reduce({tree, Money.new(0)}, fn(k, acc) ->
                # IEx.pry
                {tree, sum} = fun.(elem(acc, 0), keys ++ [k], fun)
                # IEx.pry
                {Map.merge(elem(acc, 0), tree), Money.add(elem(acc, 1), sum)}
              end)
            # IEx.pry
            {put_in(tree, keys ++ [:sum], sum), sum}
        end
      end

      res_tree = category_tree
        |> Map.keys
        |> Enum.reduce(category_tree, fn(key, acc) ->
          {tree, sum} = go_down.(acc, [key], go_down)
          # IEx.pry
          # tree = put_in(tree, [key, :sum], sum)
          Map.merge(acc, tree)
        end)
      # end
      IO.inspect res_tree

      IEx.pry
    end

    render(conn, "report.json", transactions: transactions, category_tree: res_tree)
  end

  def initialized_map(map, keys) do
    Enum.reduce(keys, {[], map}, fn(key, acc) ->
      res = elem(acc, 0) ++ [key]
      map = elem(acc, 1)
      map =
        case get_in(map, res) do
          nil ->
            put_in(map, res, %{})
          _ ->
            map
        end
      {res, map}
    end) |> elem(1)
  end

end


# parents = all.find(parent_id == nil).each {|p| hash[p.id] = p }
# hash = {}
# parents.each do |par|
#   add_to(par)
# end

# def add_to(par) do
#   finded = all.find(par.id == e.parent_id)
#   finded.each { add_to(f)}
#   finded.each do |c|
#     hash[par.id][c.id] = c
#   end

# end

# map = %{}
# keys = [:a, :b, :c]


defmodule Service.MiscScripts do
require IEx
@doc """
Changes String Map to Map of Atoms e.g. %{"c"=> "d", "x" => %{"yy" => "zz"}} to
        %{c: "d", x: %{yy: "zz"}}, i.e changes even the nested maps.
"""

def  convert_to_atom_map(map), do: to_atom_map(map)

def transform_key(key = %Hb.Category{}), do: key.name
def transform_key(key) when is_atom(key), do: Atom.to_string(key)

def to_atom_map(v = %Money{}), do: Money.to_string(v)
def to_atom_map(map) when is_map(map), do: Map.new(map, fn {k,v} -> {transform_key(k), to_atom_map(v)} end)
def to_atom_map(v), do: v

end
