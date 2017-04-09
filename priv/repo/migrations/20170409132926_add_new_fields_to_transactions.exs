defmodule Hb.Repo.Migrations.AddNewFieldsToTransactions do
  use Ecto.Migration

  def up do
    alter table(:transactions) do
      add :author_id, references(:users, on_delete: :nothing), null: false
      add :category_id, references(:categories, on_delete: :nothing), null: false
      add :source_account_id, references(:accounts, on_delete: :nothing), null: false
      add :destination_account_id, references(:accounts, on_delete: :nothing)
      add :exec_at, :utc_datetime, null: false
    end

    create index(:transactions, [:author_id])
    create index(:transactions, [:category_id])
    create index(:transactions, [:source_account_id])
    create index(:transactions, [:destination_account_id])
  end

  def down do
    drop index(:transactions, [:author_id])
    drop index(:transactions, [:category_id])
    drop index(:transactions, [:source_account_id])
    drop index(:transactions, [:destination_account_id])

    alter table(:transactions) do
      remove :author_id
      remove :category_id
      remove :source_account_id
      remove :destination_account_id
      remove :exec_at
    end
  end
end
