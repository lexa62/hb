defmodule Hb.Accounting do
  use Hb.Web, :model

  alias Hb.{Repo, User, Transaction}

  schema "accounting" do
    belongs_to :user, User, foreign_key: :owner_id
    has_many :transactions, Transaction

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:owner_id])
    |> validate_required([:owner_id])
  end

  def preload_all(query) do
    transactions_query = from t in Transaction, order_by: [desc: t.created_at]

    from a in query, preload: [transactions: ^transactions_query]
  end
end
