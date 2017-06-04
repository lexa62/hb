defmodule Hb.FinancialGoal do
  use Hb.Web, :model

  alias Hb.{Accounting, Currency}

  schema "financial_goals" do
    field :goal_amount, Money.Ecto.Type
    field :current_amount, Money.Ecto.Type
    field :name, :string

    belongs_to :accounting, Accounting
    belongs_to :currency, Currency

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:goal_amount, :name, :current_amount, :accounting_id, :currency_id])
    |> validate_required([:goal_amount, :name, :accounting_id, :currency_id])
    |> validate_length(:name, max: 255)
  end

  def preload_all(query) do
    from f in query, preload: [:currency]
  end

  defimpl Poison.Encoder, for: Hb.FinancialGoal do
    def encode(model, options) do
      model
      |> Map.take([:id, :name, :currency])
      |> Map.put(:goal_amount, Money.to_string(model.goal_amount))
      |> Map.put(:current_amount, Money.to_string(model.current_amount))
      |> Poison.Encoder.encode(options)
    end
  end
end
