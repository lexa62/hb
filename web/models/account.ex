defmodule Hb.Account do
  use Hb.Web, :model

  alias Hb.{CurrencyBalance, Accounting, Transaction}

  @derive {Poison.Encoder, only: [:id, :name, :is_default, :currency_balances]}

  schema "accounts" do
    field :name, :string
    field :is_default, :boolean, default: false

    has_many :currency_balances, CurrencyBalance, on_delete: :delete_all
    belongs_to :accounting, Accounting

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :is_default, :accounting_id])
    |> validate_required([:name, :is_default, :accounting_id])
    |> unique_constraint(:is_default, name: "accounts_is_default_accounting_id_index")
  end

  def preload_all(query) do
    currency_balances_query = from CurrencyBalance, order_by: [desc: :inserted_at], preload: :currency
    from f in query, preload: [currency_balances: ^currency_balances_query]

  end
end
