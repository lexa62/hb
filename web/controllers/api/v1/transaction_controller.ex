require IEx;
defmodule Hb.TransactionController do
  use Hb.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Transaction, User, CurrencyBalance}

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

    result = TransactionsCsvSerializer.parse_and_save(file.path, String.to_integer(accounting_id), current_user.id)
    # Repo.all(CurrencyBalance) |> Enum.each(fn c -> c |> CurrencyBalance.calculate_current_amount |> Repo.update! end)

    render(conn, "import.json", result: result)
  end
end
