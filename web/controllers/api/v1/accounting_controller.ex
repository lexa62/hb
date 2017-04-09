defmodule Hb.AccountingController do
  use Hb.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Accounting}

  def index(conn, _params) do
    current_user = Guardian.Plug.current_resource(conn)

    owned_accounting = current_user
      |> assoc(:owned_accounting)
      |> Accounting.preload_all
      |> Repo.all

    participated_acccounting = current_user
      |> assoc(:all_accounting)
      |> Accounting.not_owned_by(current_user.id)
      |> Accounting.preload_all
      |> Repo.all

    render(conn, "index.json", owned_accounting: owned_accounting, participated_acccounting: participated_acccounting)
  end
end
