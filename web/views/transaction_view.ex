defmodule Hb.TransactionView do
  require IEx
  use Hb.Web, :view

  def render("export.json", %{content: csv_content}) do
    %{content: csv_content}
  end

  def render("import.json", %{result: result}) do
    %{result: result}
  end

  def render("report.json", %{transactions: transactions, category_tree: res_tree}) do
    # %{report_transactions: transactions |> Enum.count, category_tree: Service.MiscScripts.to_atom_map(res_tree)}
    %{report_transactions: Service.MiscScripts.to_atom_map(res_tree)}
  end
end
