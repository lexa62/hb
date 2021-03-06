defmodule Hb.AccountTest do
  use Hb.ModelCase

  alias Hb.Account

  @valid_attrs %{is_default: true, name: "some content", accounting_id: 1}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Account.changeset(%Account{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Account.changeset(%Account{}, @invalid_attrs)
    refute changeset.valid?
  end
end
