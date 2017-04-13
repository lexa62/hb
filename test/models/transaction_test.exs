defmodule Hb.TransactionTest do
  use Hb.ModelCase

  alias Hb.Transaction

  @valid_attrs %{amount: "120.5",
                 description: "some content",
                 type: :expense,
                 accounting_id: 1,
                 source_account_id: 1,
                 category_id: 1,
                 author_id: 1,
                 exec_at: DateTime.utc_now,
                 currency_id: 1}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Transaction.changeset(%Transaction{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Transaction.changeset(%Transaction{}, @invalid_attrs)
    refute changeset.valid?
  end
end
