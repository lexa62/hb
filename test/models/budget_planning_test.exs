defmodule Hb.BudgetPlanningTest do
  use Hb.ModelCase

  alias Hb.BudgetPlanning

  @valid_attrs %{expense_amount: 42, income_amount: 42, period: %{hour: 14, min: 0, sec: 0}}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = BudgetPlanning.changeset(%BudgetPlanning{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = BudgetPlanning.changeset(%BudgetPlanning{}, @invalid_attrs)
    refute changeset.valid?
  end
end
