defmodule Hb.ReportView do
  use Hb.Web, :view

  def render("index.json", _sdf) do
    %{ok: :ok}
  end
end
