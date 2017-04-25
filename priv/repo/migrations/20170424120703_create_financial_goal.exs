defmodule Hb.Repo.Migrations.CreateFinancialGoal do
  use Ecto.Migration

  def change do
    create table(:financial_goals) do
      add :goal_amount, :integer, null: false
      add :name, :string, null: false
      add :current_amount, :integer, null: false, default: 0
      add :accounting_id, references(:accounting, on_delete: :nothing), null: false
      add :currency_id, references(:currencies, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:financial_goals, [:accounting_id])
    create index(:financial_goals, [:currency_id])

  end
end
