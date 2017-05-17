defmodule Hb.FinancialGoalTest do
  use Hb.ModelCase

  alias Hb.FinancialGoal

  @valid_attrs %{current_amount: 42, goal_amount: 42, name: "some content", accounting_id: 1, currency_id: 1}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = FinancialGoal.changeset(%FinancialGoal{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = FinancialGoal.changeset(%FinancialGoal{}, @invalid_attrs)
    refute changeset.valid?
  end
end
