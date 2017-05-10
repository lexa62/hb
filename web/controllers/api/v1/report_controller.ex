defmodule Hb.ReportController do
  use Hb.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, handler: Hb.SessionController

  alias Hb.{Repo, Transaction, User}


end
