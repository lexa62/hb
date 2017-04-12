defmodule Hb.CurrencyBalance do
  use Hb.Web, :model
  require IEx

  alias Hb.{Account, Currency, Repo, Transaction}

  # @derive {Poison.Encoder, only: [:id, :initial_amount, :current_amount, :account_id, :currency]}

  schema "currency_balances" do
    field :initial_amount, Money.Ecto.Type
    field :current_amount, Money.Ecto.Type
    belongs_to :account, Account
    belongs_to :currency, Currency

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:initial_amount, :current_amount, :account_id, :currency_id])
    |> validate_required([:initial_amount, :current_amount, :account_id, :currency_id])
  end

  def calculate_current_amount(model) do
    # model = current_changeset.data
    # income_sum = from t_i in Transaction, where: t_i.type == ^:income and
    #                                                       t_i.source_account_id == ^(model.account_id) and
    #                                                       t_i.currency_id == ^(model.currency_id),
    #                                                select: sum(t_i.amount)
    # expense_sum = from t_e in Transaction, where: t_e.type == ^:expense and
    #                                                       t_e.source_account_id == ^(model.account_id) and
    #                                                       t_e.currency_id == ^(model.currency_id),
    #                                                 select: sum(t_e.amount)

    query = from t in Transaction, where: t.source_account_id == ^(model.account_id) and
                                                 t.currency_id == ^(model.currency_id),
                                          select: {t.type, t.amount, t.source_account_id, t.destination_account_id}
    current_amount = Repo.all(query)
    |> Enum.reduce(Money.new(0), fn(t, acc) ->
        case t do
          {:expense, amount, _source_account_id, _destination_account_id} ->
            Money.subtract(acc, amount)
          {:income, amount, _source_account_id, _destination_account_id} ->
            Money.add(acc, amount)
          {:transfer, amount, source_account_id, destination_account_id} ->
            cond do
              source_account_id == model.account_id ->
                Money.subtract(acc, amount)
              destination_account_id == model.account_id ->
                Money.add(acc, amount)
            end
        end
      end)
    |> Money.add(model.initial_amount)
    changeset(model, %{current_amount: current_amount})
    # result = from t_i in subquery(income_transactions),

    # (hd(Repo.all(income_sum)) || 0) - (hd(Repo.all(expense_sum)) || 0)
    # income_transactions = from t_i in Transaction, where: t.type == ^:expense

  end

  # defp calculate_position(current_changeset) do
  #   model = current_changeset.data

  #   query = from(c in Card,
  #           select: c.position,
  #           where: c.list_id == ^(model.list_id),
  #           order_by: [desc: c.position],
  #           limit: 1)

  #   case Repo.one(query) do
  #     nil      -> put_change(current_changeset, :position, 1024)
  #     position -> put_change(current_changeset, :position, position + 1024)
  #   end
  # end

  defimpl Poison.Encoder, for: Hb.CurrencyBalance do
    def encode(model, options) do
      model
      |> Map.take([:id, :currency, :account_id])
      |> Map.put(:current_amount, Money.to_string(model.current_amount))
      |> Map.put(:initial_amount, Money.to_string(model.initial_amount))
      |> Poison.Encoder.encode(options)
    end
  end
end
