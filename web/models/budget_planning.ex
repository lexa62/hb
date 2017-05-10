defmodule Hb.BudgetPlanning do
  use Hb.Web, :model

  schema "budget_plannings" do
    field :income_amount, Money.Ecto.Type
    field :expense_amount, Money.Ecto.Type
    field :period, :date
    belongs_to :accounting, Hb.Accounting

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:income_amount, :expense_amount, :period, :accounting_id])
    |> validate_required([:income_amount, :expense_amount, :period, :accounting_id])
  end
end
