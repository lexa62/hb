defmodule Hb.Category do
  use Hb.Web, :model

  alias Hb.{Accounting}

  use Arbor.Tree

  @derive {Poison.Encoder, only: [:id, :type, :name, :parent_id]}

  schema "categories" do
    field :name, :string
    field :type, CategoryTypeEnum
    belongs_to :parent, Arbor.Comment
    belongs_to :accounting, Accounting

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :type, :parent_id, :accounting_id])
    |> validate_required([:name, :type, :accounting_id])
  end
end
