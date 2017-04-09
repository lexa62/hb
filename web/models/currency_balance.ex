defmodule Hb.CurrencyBalance do
  use Hb.Web, :model

  schema "currency_balances" do
    field :initial_amount, Money.Ecto.Type
    field :current_amount, Money.Ecto.Type
    belongs_to :account, Hb.Account
    belongs_to :currency, Hb.Currency

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:initial_amount, :current_amount, :account_id, :currency_id])
    |> validate_required([:initial_amount, :current_amount, :account_id, :currency_id])
  end
end
