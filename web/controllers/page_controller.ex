defmodule Hb.PageController do
  use Hb.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
