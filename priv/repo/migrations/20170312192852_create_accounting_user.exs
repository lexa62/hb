defmodule Hb.Repo.Migrations.CreateAccountingUser do
  use Ecto.Migration

  def change do
    create table(:accounting_users) do
      add :accounting_id, references(:accounting, on_delete: :nothing), null: false
      add :user_id, references(:users, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:accounting_users, [:accounting_id])
    create index(:accounting_users, [:user_id])

  end
end
