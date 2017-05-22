defmodule Hb.ReportView do
  use Hb.Web, :view

  def render("index.json", _sdf) do
    %{ok: :ok}
  end

  def render("report.json", %{transactions: transactions, category_tree: res_tree}) do
    %{transactions: transactions, tree: Service.MiscScripts.convert_to_string_map(res_tree)}
  end
end
