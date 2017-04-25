defmodule Hb.FinancialGoalController do
  use Hb.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Accounting, FinancialGoal}

  def index(conn, %{"accounting_id" => accounting_id}) do
    current_user = Guardian.Plug.current_resource(conn)

    financial_goals = current_user
      |> assoc(:all_accounting)
      |> Repo.get(accounting_id)
      |> assoc(:financial_goals)
      |> prepare_query
      |> FinancialGoal.preload_all
      |> Repo.all

    render(conn, "index.json", financial_goals: financial_goals)
  end

  defp prepare_query(query) do
    from f in query, order_by: [asc: f.inserted_at]
  end
end
