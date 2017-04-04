defmodule Hb.Currency do
  use Hb.Web, :model

  schema "currencies" do
    field :name, :string
    field :iso_code, :integer
    field :manual_rate, :float
    field :is_default, :boolean, default: false
    belongs_to :accounting, Hb.Accounting

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :iso_code, :manual_rate, :is_default, :accounting_id])
    |> validate_required([:name, :iso_code, :accounting_id])
    |> unique_constraint(:is_default, name: "currencies_is_default_accounting_id_index")
  end
end
