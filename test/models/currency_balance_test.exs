defmodule Hb.CurrencyBalanceTest do
  use Hb.ModelCase

  alias Hb.CurrencyBalance

  @valid_attrs %{current_amount: 42, initial_amount: 42}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = CurrencyBalance.changeset(%CurrencyBalance{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = CurrencyBalance.changeset(%CurrencyBalance{}, @invalid_attrs)
    refute changeset.valid?
  end
end
