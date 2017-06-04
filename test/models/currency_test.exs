defmodule Hb.CurrencyTest do
  use Hb.ModelCase

  alias Hb.Currency

  @valid_attrs %{is_defaut: true, iso_code: "BYN", manual_rate: "120.5", name: "some content", accounting_id: 1}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Currency.changeset(%Currency{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Currency.changeset(%Currency{}, @invalid_attrs)
    refute changeset.valid?
  end
end
