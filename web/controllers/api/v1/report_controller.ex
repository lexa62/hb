defmodule Hb.ReportController do
  use Hb.Web, :controller
  use Filterable.Phoenix.Controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Transaction, User, Category}

  filterable do
    @options cast: :datetime
    filter from(query, value, _conn) do
      datetime = NaiveDateTime.new(value.year, value.month, value.day, 0, 0, 0)
        |> elem(1)
        |> DateTime.from_naive!("Etc/UTC")
      query |> where([t], t.exec_at >= ^datetime)
    end

    @options cast: :datetime
    filter to(query, value, _conn) do
      datetime = NaiveDateTime.new(value.year, value.month, value.day, 0, 0, 0)
        |> elem(1)
        |> DateTime.from_naive!("Etc/UTC")
      query |> where([t], t.exec_at < ^datetime)
    end

    @options cast: :integer
    filter account(query, value, _conn) do
      query |> where([t], t.source_account_id == ^value or t.destination_account_id == ^value)
    end

    @options cast: :integer
    filter author(query, value, _conn) do
      query |> where([t], t.author_id == ^value)
    end

    @options cast: :integer
    filter category(query, value, _conn) do
      query |> where([t], t.category_id == ^value)
    end
  end

  def index(conn, params) do
    current_user = Guardian.Plug.current_resource(conn)

    accounting = current_user
      |> assoc(:all_accounting)
      |> Repo.get(params["accounting_id"])

    transactions = accounting
      |> assoc(:transactions)
      |> apply_filters!(conn)
      |> elem(0)
      |> Transaction.preload_all
      |> from(preload: :source_account)
      |> Repo.all

    currencies = accounting
      |> assoc(:currencies)
      |> Repo.all

    categories_graph_data =
      case params["grouped"] do
        "true" ->
          transactions
            |> Enum.group_by(&(&1.category))
            |> Enum.reduce(%{income: [], expense: []}, fn({k, v}, acc) ->
              value = Enum.reduce(v, 0, fn t, acc ->
                Transaction.get_transformed_amount(t,
                                                   params["currency"],
                                                   currencies).amount + acc
              end) |> Money.new |> Money.to_string
              case k && k.type do
                :expense ->
                  Map.update!(acc, :expense, &([[k.name, value] | &1]))
                :income ->
                  Map.update!(acc, :income, &([[k.name, value] | &1]))
                _ ->
                  acc
               end
            end)
        _ ->
        %{income: [], expense: []}
      end

    accounts_graph_data = transactions
      |> Enum.filter(&(&1.type == :income))
      |> Enum.group_by(&(&1.source_account))
      |> Enum.reduce([], fn({k, v}, acc) ->
        value = Enum.reduce(v, 0, fn t, acc ->
          Transaction.get_transformed_amount(t,
                                             params["currency"],
                                             currencies).amount + acc
        end) |> Money.new |> Money.to_string
        [[k.name, value] | acc]
      end)

    transactions_query = accounting
      |> assoc(:transactions)

    query = from t in transactions_query,
      where: t.type in [^:expense, ^:income] and
             t.exec_at > datetime_add(^Ecto.DateTime.utc, -5, "month"),
      preload: [:currency, :author]

    dynamic_graph_data = query
      |> Repo.all
      |> Enum.group_by(&("#{&1.exec_at.year}/#{&1.exec_at.month |> Integer.to_string |> String.rjust(2, ?0)}"))
      |> Enum.reduce(%{}, fn({k, v}, acc) ->
        value = Enum.reduce(v, %{expense: 0, income: 0}, fn transaction, acc ->
          amount = Transaction.get_transformed_amount(transaction,
                                                      params["currency"],
                                                      currencies)
          Map.put(acc, transaction.type, acc[transaction.type] + amount.amount)
        end) |> Enum.reduce(%{}, fn({k, v}, acc) -> Map.put(acc, k, Money.new(v) |> Money.to_string) end)
        Map.put(acc, k, value)
      end)

    text conn, Poison.encode!(%{transactions: transactions,
                                tree: %{},
                                dynamic_graph: dynamic_graph_data,
                                categories_graph_data: categories_graph_data,
                                accounts_graph_data: accounts_graph_data}, [transform_currency: params["currency"],
                                                                            currencies: currencies])
  end

end
