defmodule Hb.AccountingTest do
  use Hb.ModelCase

  alias Hb.Accounting

  @valid_attrs %{}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Accounting.changeset(%Accounting{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Accounting.changeset(%Accounting{}, @invalid_attrs)
    refute changeset.valid?
  end
end
