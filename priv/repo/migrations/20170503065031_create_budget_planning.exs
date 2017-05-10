defmodule Hb.Repo.Migrations.CreateBudgetPlanning do
  use Ecto.Migration

  def change do
    create table(:budget_plannings) do
      add :income_amount, :integer, null: false
      add :expense_amount, :integer, null: false
      add :period, :date, null: false
      add :accounting_id, references(:accounting, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:budget_plannings, [:accounting_id])

  end
end
