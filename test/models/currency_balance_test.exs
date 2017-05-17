defmodule Hb.CurrencyBalanceTest do
  use Hb.ModelCase

  alias Hb.CurrencyBalance

  @valid_attrs %{current_amount: 42, initial_amount: 42, account_id: 1, currency_id: 1}
  @invalid_attrs %{current_amount: nil, initial_amount: nil, account_id: nil, currency_id: nil}

  test "changeset with valid attributes" do
    changeset = CurrencyBalance.changeset(%CurrencyBalance{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = CurrencyBalance.changeset(%CurrencyBalance{}, @invalid_attrs)
    refute changeset.valid?
  end
end
