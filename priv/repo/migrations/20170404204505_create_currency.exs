defmodule Hb.Repo.Migrations.CreateCurrency do
  use Ecto.Migration

  def change do
    create table(:currencies) do
      add :name, :string, size: 3, null: false
      add :iso_code, :integer, null: false
      add :manual_rate, :float
      add :is_default, :boolean, default: false, null: false
      add :accounting_id, references(:accounting, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:currencies, [:accounting_id])
    create index(:currencies, [:iso_code])
    create unique_index(:currencies, [:is_default, :accounting_id],
      where: "is_default = true")
  end
end
