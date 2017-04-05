defmodule Hb.Accounting do
  use Hb.Web, :model

  alias Hb.{Repo, User, Transaction, Currency}

  @derive {Poison.Encoder, only: [:id, :transactions, :currencies]}

  schema "accounting" do
    belongs_to :user, User, foreign_key: :owner_id
    has_many :transactions, Transaction
    has_many :currencies, Currency

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
    transactions_query = from t in Transaction, order_by: [desc: t.inserted_at]
    currencies_query = from c in Currency

    from a in query, preload: [transactions: ^transactions_query, currencies: ^currencies_query]
  end
end
