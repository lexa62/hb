defmodule Hb.AccountingUser do
  use Hb.Web, :model

  alias Hb.{Accounting, User}

  @derive {Poison.Encoder, only: [:id, :user, :inserted_at]}

  schema "accounting_users" do
    belongs_to :accounting, Accounting
    belongs_to :user, User

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:accounting_id, :user_id])
    |> validate_required([:accounting_id, :user_id])
  end

  def preload_all(query) do
    from f in query, preload: [:user]
  end
end
