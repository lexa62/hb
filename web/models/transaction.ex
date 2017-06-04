defmodule Hb.Transaction do
  use Hb.Web, :model

  alias Hb.{Accounting, Currency, Category, User, Account, Repo, CurrencyBalance}

  schema "transactions" do
    field :amount, Money.Ecto.Type
    field :description, :string
    field :type, TransactionTypeEnum
    field :exec_at, :utc_datetime

    belongs_to :currency, Currency
    belongs_to :accounting, Accounting
    belongs_to :category, Category
    belongs_to :author, User, foreign_key: :author_id
    belongs_to :source_account, Account, foreign_key: :source_account_id
    belongs_to :destination_account, Account, foreign_key: :destination_account_id

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:amount, :description, :type, :currency_id, :accounting_id, :author_id, :category_id, :source_account_id, :destination_account_id, :exec_at])
    |> set_category_for_transfer
    |> validate_required([:amount, :type, :author_id, :category_id, :source_account_id, :exec_at, :accounting_id, :currency_id])
  end

  defp set_category_for_transfer(changeset) do
    case get_field(changeset, :type) do
      :transfer ->
        category =
          Repo.get_by(Category, name: "Перевод", accounting_id: get_field(changeset, :accounting_id), type: :none) ||
          Repo.insert!(%Category{name: "Перевод", accounting_id: get_field(changeset, :accounting_id), type: :none})
        put_change(changeset, :category_id, category.id)
      _ ->
        changeset
    end
  end

  def preload_all(query) do
    from f in query, preload: [:currency, :author, :category]
  end

  def get_transformed_amount(model, currency_code, currencies) do
    case currency_code do
      nil ->
        model.amount
      code ->
        cond do
          code != model.currency.iso_code ->
            to_currency = Enum.find(currencies, &(&1.iso_code == code))
            cond do
              to_currency.is_default ->
                current_currency_rate =
                  if(model.currency.manual_rate) do
                    model.currency.manual_rate
                  else
                    YahooFinance.exchange_rate_for([model.currency.iso_code, to_currency.iso_code]) |> elem(1)
                  end
                Money.multiply(model.amount, current_currency_rate)
              model.currency.is_default ->
                to_currency_rate =
                  if(to_currency.manual_rate) do
                    to_currency.manual_rate
                  else
                    YahooFinance.exchange_rate_for([to_currency.iso_code, model.currency.iso_code]) |> elem(1)
                  end
                model.amount.amount / to_currency_rate |> round |> Money.new
              !to_currency.is_default ->
                default_currency = Enum.find(currencies, &(&1.is_default == true))
                current_currency_rate =
                  if(model.currency.manual_rate) do
                    model.currency.manual_rate
                  else
                    YahooFinance.exchange_rate_for([model.currency.iso_code, default_currency.iso_code]) |> elem(1)
                  end
                to_currency_rate =
                  if(to_currency.manual_rate) do
                    to_currency.manual_rate
                  else
                    YahooFinance.exchange_rate_for([to_currency.iso_code, default_currency.iso_code]) |> elem(1)
                  end
                model.amount.amount * current_currency_rate / to_currency_rate |> round |> Money.new
            end
          true ->
            model.amount
        end
    end
  end

  def update_currency_balance(transaction) do
    case transaction.type do
      :transfer ->
        Repo.all(from a in Account, where: a.id in [^transaction.source_account_id, ^transaction.destination_account_id])
        |> Enum.map(fn(account) ->
          currency_balance = account
            |> assoc(:currency_balances)
            |> Repo.get_by(currency_id: transaction.currency_id)

          currency_balance = case currency_balance do
            nil -> Repo.insert!(%CurrencyBalance{currency_id: transaction.currency_id, account_id: account.id, initial_amount: Money.new(0), current_amount: Money.new(0)})
            b -> b
          end
          |> CurrencyBalance.calculate_current_amount
          |> Repo.update!
          currency_balance
        end)
      _ ->
        currency_balance = Repo.get(Account, transaction.source_account_id)
          |> assoc(:currency_balances)
          |> Repo.get_by(currency_id: transaction.currency_id)

        currency_balance = case currency_balance do
          nil -> Repo.insert!(%CurrencyBalance{currency_id: transaction.currency_id, account_id: transaction.source_account_id, initial_amount: Money.new(0), current_amount: Money.new(0)})
          b -> b
        end
        |> CurrencyBalance.calculate_current_amount
        |> Repo.update!
        [currency_balance]
    end
  end

  defimpl Poison.Encoder, for: Hb.Transaction do
    def encode(model, options) do
      amount = Hb.Transaction.get_transformed_amount(model,
                                                     options[:transform_currency],
                                                     options[:currencies])
        |> Money.to_string
      model
      |> Map.take([:id, :description, :type, :category_id, :currency, :updated_at, :author, :source_account_id, :destination_account_id])
      |> Map.put(:amount, amount)
      |> Poison.Encoder.encode(options)
    end
  end
end
