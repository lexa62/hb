defmodule Hb.TransactionView do
  require IEx
  use Hb.Web, :view

  def render("export.json", %{content: csv_content}) do
    %{content: csv_content}
  end

  def render("import.json", %{result: result}) do
    %{result: result}
  end
end
