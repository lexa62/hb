defmodule Hb.Transaction do
  use Hb.Web, :model

  alias __MODULE__
  alias Hb.{Accounting}

  schema "transactions" do
    field :amount, :float
    field :description, :string
    field :type, TransactionTypeEnum

    belongs_to :accounting, Accounting

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:amount, :description, :type])
    |> validate_required([:amount, :type])
  end
end
