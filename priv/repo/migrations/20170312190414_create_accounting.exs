defmodule Hb.Repo.Migrations.CreateAccounting do
  use Ecto.Migration

  def change do
    create table(:accounting) do
      add :owner_id, references(:users, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:accounting, [:owner_id])

  end
end
