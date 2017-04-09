defmodule Hb.Repo.Migrations.CreateAccount do
  use Ecto.Migration

  def change do
    create table(:accounts) do
      add :name, :string, null: false
      add :is_default, :boolean, default: false, null: false
      add :accounting_id, references(:accounting, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:accounts, [:accounting_id])
    create index(:accounts, [:is_default])
    create unique_index(:accounts, [:is_default, :accounting_id],
      where: "is_default = true")
  end
end
