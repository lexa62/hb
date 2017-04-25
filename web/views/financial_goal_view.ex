defmodule Hb.FinancialGoalView do
  use Hb.Web, :view

  def render("index.json", %{financial_goals: financial_goals}) do
    %{financial_goals: financial_goals}
  end
end
