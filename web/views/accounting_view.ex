defmodule Hb.BoardView do
  use Hb.Web, :view

  alias Hb.Accounting

  def render("index.json", %{owned_accounting: owned_accounting, participated_acccounting: participated_acccounting}) do
    %{owned_accounting: owned_accounting, participated_acccounting: participated_acccounting}
  end
end
