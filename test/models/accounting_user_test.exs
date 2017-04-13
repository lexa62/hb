defmodule Hb.AccountingUserTest do
  use Hb.ModelCase

  alias Hb.AccountingUser

  @valid_attrs %{accounting_id: 1, user_id: 1}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = AccountingUser.changeset(%AccountingUser{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = AccountingUser.changeset(%AccountingUser{}, @invalid_attrs)
    refute changeset.valid?
  end
end
