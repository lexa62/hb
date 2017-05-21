defmodule Hb.Accounting do
  use Hb.Web, :model

  alias __MODULE__
  alias Hb.{User, Transaction, Currency, Account, Category, FinancialGoal, AccountingUser}

  @derive {Poison.Encoder, only: [:id, :transactions, :currencies, :accounts, :categories, :inserted_at, :accounting_users]}

  schema "accounting" do
    belongs_to :user, User, foreign_key: :owner_id
    has_many :transactions, Transaction
    has_many :currencies, Currency
    has_many :accounts, Account
    has_many :categories, Category
    has_many :financial_goals, FinancialGoal
    has_many :accounting_users, AccountingUser

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:owner_id])
    |> validate_required([:owner_id])
  end

  def not_owned_by(query \\ %Accounting{}, user_id) do
    from a in query, where: a.owner_id != ^user_id
  end

  def preload_all(query) do
    transactions_query = from t in Transaction, order_by: [desc: t.inserted_at], preload: :currency
    currencies_query = from cur in Currency
    accounts_query = from a in Account, order_by: [asc: a.inserted_at], preload: [currency_balances: :currency]
    categories_query = from cat in Category
    accounting_users_query = from a_u in AccountingUser, preload: :user

    from a in query, preload: [transactions: ^transactions_query,
                               currencies: ^currencies_query,
                               accounts: ^accounts_query,
                               categories: ^categories_query,
                               accounting_users: ^accounting_users_query]
  end
end
