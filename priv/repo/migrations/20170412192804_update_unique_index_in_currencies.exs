defmodule Hb.Repo.Migrations.UpdateUniqueIndexInCurrencies do
  use Ecto.Migration

  def up do
    drop unique_index(:currencies, [:iso_code])
    create unique_index(:currencies, [:iso_code, :accounting_id])
  end

  def down do
    drop unique_index(:currencies, [:iso_code, :accounting_id])
    create unique_index(:currencies, [:iso_code])
  end
end
