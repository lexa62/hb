defmodule Hb.Accounting do
  use Hb.Web, :model

  alias __MODULE__
  alias Hb.{User, Transaction, Currency, Account, Category, FinancialGoal, AccountingUser}

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
    transactions_query = from t in Transaction, order_by: [desc: t.inserted_at], preload: [:currency, :author], limit: 10
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

  def get_categories_tree(categories) do
    category_tree = %{}
    roots = categories |> Enum.filter(&(&1.parent_id == nil))

    category_tree = roots
      |> Enum.reduce(category_tree, fn(t, acc) ->
        acc = Map.put(acc, Integer.to_string(t.id), %{node: t})
      end)

    add_to = fn(parent, tree, keys, fun) ->
      categories
        |> Enum.filter(&(&1.parent_id == parent.id))
        |> Enum.reduce(tree, fn(c, acc) ->
          keys = keys ++ [Integer.to_string(c.id)]
          acc = Map.merge(acc, fun.(c, acc, keys, fun))
          res = Service.MiscScripts.initialized_map(acc, keys)
          put_in(res, keys ++ [:node], c)
        end)
    end

    category_tree = roots
      |> Enum.reduce(category_tree, fn(r, acc) ->
        res_map = add_to.(r, acc, [Integer.to_string(r.id)], add_to)
        acc = Map.merge(acc, res_map)
        acc
      end)
  end


  defimpl Poison.Encoder, for: Hb.Accounting do
    def encode(model, options) do
      model
      |> Map.take([:id, :transactions, :currencies, :accounts, :categories, :inserted_at, :accounting_users])
      |> Map.put(:categories_tree, Hb.Accounting.get_categories_tree(model.categories))
      |> Map.put(:transactions_count, Hb.Repo.aggregate(from(Hb.Transaction, where: [accounting_id: ^model.id]), :count, :id))
      |> Poison.Encoder.encode(options)
    end
  end
end
