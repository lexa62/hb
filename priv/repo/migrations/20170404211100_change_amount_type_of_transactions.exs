defmodule Hb.Repo.Migrations.ChangeAmountTypeOfTransactions do
  use Ecto.Migration

  def up do
    alter table(:transactions) do
      modify :amount, :integer
      add :currency_id, references(:currencies, on_delete: :nothing), null: false
    end

    create index(:transactions, [:currency_id])
  end

  def down do
    drop index(:transactions, [:currency_id])

    alter table(:transactions) do
      modify :amount, :float
      remove :currency_id
    end
  end
end
