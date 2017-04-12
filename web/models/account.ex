defmodule Hb.Account do
  use Hb.Web, :model

  alias Hb.{CurrencyBalance, Accounting}

  @derive {Poison.Encoder, only: [:id, :name, :is_default, :currency_balances]}

  schema "accounts" do
    field :name, :string
    field :is_default, :boolean, default: false

    has_many :currency_balances, CurrencyBalance
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

  # defimpl Poison.Encoder, for: Hb.Transaction do
  #   def encode(model, options) do
  #     model
  #     |> Map.take([:id, :name, :is_default])
  #     |> Map.put(:amount, Money.to_string(model.amount))
  #     |> Poison.Encoder.encode(options)
  #   end
  # end
end
