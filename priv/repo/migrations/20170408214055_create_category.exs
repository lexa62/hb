defmodule Hb.Repo.Migrations.CreateCategory do
  use Ecto.Migration

  def change do
    create table(:categories) do
      add :parent_id, references(:categories, on_delete: :nothing)
      add :accounting_id, references(:accounting, on_delete: :nothing), null: false
      add :name, :string, null: false
      add :type, :integer, null: false

      timestamps()
    end
    create index(:categories, [:parent_id])
    create index(:categories, [:accounting_id])
    create index(:categories, [:type])

  end
end
