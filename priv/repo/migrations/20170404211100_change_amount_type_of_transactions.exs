defmodule Hb.Repo.Migrations.ChangeAmountTypeOfTransactions do
  use Ecto.Migration

  def up do
    alter table(:transactions) do
      modify :amount, :integer
    end
  end

  def down do
    alter table(:transactions) do
      modify :amount, :float
    end
  end
end
