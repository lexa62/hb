defmodule Hb.Repo.Migrations.ChangeAmountTypeOfTransactions do
  use Ecto.Migration

  def up do
    alter table(:transactions) do
      modify :amount, :integer
      add :currency, :string, size: 3, null: false, default: "BYN"
    end

    create index(:transactions, [:currency])
  end

  def down do
    drop index(:transactions, [:currency])

    alter table(:transactions) do
      modify :amount, :float
      remove :currency
    end
  end
end
