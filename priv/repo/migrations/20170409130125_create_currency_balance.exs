defmodule Hb.Repo.Migrations.CreateCurrencyBalance do
  use Ecto.Migration

  def change do
    create table(:currency_balances) do
      add :initial_amount, :integer, null: false
      add :current_amount, :integer, null: false
      add :account_id, references(:accounts, on_delete: :nothing), null: false
      add :currency_id, references(:currencies, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:currency_balances, [:account_id])
    create index(:currency_balances, [:currency_id])

  end
end
