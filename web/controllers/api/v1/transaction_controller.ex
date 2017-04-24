defmodule Hb.TransactionController do
  use Hb.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Transaction, User}

  def export(conn, %{"accounting_id" => accounting_id}) do
    current_user = Guardian.Plug.current_resource(conn)

    transactions = current_user
      |> assoc(:all_accounting)
      |> Repo.get(accounting_id)
      |> assoc(:transactions)
      |> Repo.all

    csv_content = TransactionsCsvSerializer.to_csv_string(transactions)

    # conn
    # |> put_resp_content_type("text/csv")
    # |> put_resp_header("content-disposition", "attachment; filename=\"#{Date.utc_today}_export.csv\"")
    # |> send_resp(200, csv_content)

    render(conn, "export.json", content: csv_content)
  end

  def import(conn, %{"accounting_id" => accounting_id, "file" => file}) do
    current_user = Guardian.Plug.current_resource(conn)

    if file do
      IO.inspect extension = Path.extname(file.filename)
      IO.inspect File.stat(file.path)
    end


    # transactions = current_user
    #   |> assoc(:all_accounting)
    #   |> Repo.get(accounting_id)
    #   |> assoc(:transactions)
    #   |> Repo.all

    result = TransactionsCsvSerializer.parse_and_save(file.path, accounting_id, current_user.id)

    # conn
    # |> put_resp_content_type("text/csv")
    # |> put_resp_header("content-disposition", "attachment; filename=\"#{Date.utc_today}_export.csv\"")
    # |> send_resp(200, csv_content)

    render(conn, "import.json", result: result)
  end

end
