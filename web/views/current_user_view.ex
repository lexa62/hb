defmodule Hb.CurrentUserView do
  use Hb.Web, :view

  def render("show.json", %{user: user}) do
    user
  end

  def render("error.json", _) do
  end
end
