defmodule Hb.Transaction do
  use Hb.Web, :model

  # alias __MODULE__
  alias Hb.{Accounting, Currency, Category, User, Account}

  # @derive {Poison.Encoder, only: [:id, :amount, :description, :type, :currency]}

  schema "transactions" do
    field :amount, Money.Ecto.Type
    field :description, :string
    field :type, TransactionTypeEnum
    field :exec_at, :utc_datetime

    belongs_to :currency, Currency
    belongs_to :accounting, Accounting
    belongs_to :category, Category
    belongs_to :author, User, foreign_key: :author_id
    belongs_to :source_account, Account, foreign_key: :source_account_id
    belongs_to :destination_account, Account, foreign_key: :destination_account_id

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:amount, :description, :type, :currency_id, :accounting_id, :author_id, :category_id, :source_account_id, :destination_account_id, :exec_at])
    |> validate_required([:amount, :type, :author_id, :category_id, :source_account_id, :exec_at])
  end

  defimpl Poison.Encoder, for: Hb.Transaction do
    def encode(model, options) do
      model
      |> Map.take([:id, :description, :type, :currency])
      |> Map.put(:amount, Money.to_string(model.amount))
      |> Poison.Encoder.encode(options)
    end
  end
end
