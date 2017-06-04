defmodule Hb.CurrencyBalance do
  use Hb.Web, :model

  alias Hb.{Account, Currency, Repo, Transaction}

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
    query = from t in Transaction, where: (t.source_account_id == ^(model.account_id) or
                                           t.destination_account_id == ^(model.account_id)) and
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
  end

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
