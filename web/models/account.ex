defmodule Hb.Account do
  use Hb.Web, :model

  @derive {Poison.Encoder, only: [:id, :name, :is_default]}

  schema "accounts" do
    field :name, :string
    field :is_default, :boolean, default: false
    belongs_to :accounting, Hb.Accounting

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
end
