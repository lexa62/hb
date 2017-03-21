defmodule Hb.Repo.Migrations.CreateTransaction do
  use Ecto.Migration

  def change do
    create table(:transactions) do
      add :amount, :float, null: false
      add :description, :text
      add :type, :integer, null: false

      add :accounting_id, references(:accounting, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:transactions, [:accounting_id])

  end
end
