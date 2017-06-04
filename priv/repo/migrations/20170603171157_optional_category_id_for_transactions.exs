defmodule Hb.Repo.Migrations.OptionalCategoryIdForTransactions do
  use Ecto.Migration

  def change do
    alter table(:transactions) do
      modify :category_id, :integer, null: true
    end
  end
end
