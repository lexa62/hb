defmodule Hb.ReportView do
  use Hb.Web, :view

  def render("index.json", _sdf) do
    %{ok: :ok}
  end

  def render("report.json", %{transactions: transactions, category_tree: res_tree}) do
    map = %{transactions: transactions, tree: %{}}
    Poison.encode(map, [transform_currency: "EUR"])
  end
end
