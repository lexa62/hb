defmodule Hb.Transaction do
  use Hb.Web, :model

  alias __MODULE__
  alias Hb.{Accounting}

  @derive {Poison.Encoder, only: [:id, :amount, :description, :type, :currency]}

  schema "transactions" do
    field :amount, Money.Ecto.Type
    field :description, :string
    field :type, TransactionTypeEnum
    field :currency, :string

    belongs_to :accounting, Accounting

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:amount, :description, :type, :currency])
    |> validate_required([:amount, :type])
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
