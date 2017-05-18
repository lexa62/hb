defmodule Hb.RegistrationController  do
  use Hb.Web, :controller

  alias Hb.{Repo, User, Accounting, AccountingUser}

  plug :scrub_params, "user" when action in [:create]

  def create(conn, %{"user" => user_params}) do
    changeset = User.changeset(%User{}, user_params)

    case Repo.insert(changeset) do
      {:ok, user} ->
        {:ok, jwt, _full_claims} = Guardian.encode_and_sign(user, :token)

        accounting = user
        |> Ecto.build_assoc(:owned_accounting)
        |> Accounting.changeset(%{})
        |> Repo.insert!

        user
        |> build_assoc(:accounting_users)
        |> AccountingUser.changeset(%{accounting_id: accounting.id})
        |> Repo.insert!

        conn
        |> put_status(:created)
        |> render(Hb.SessionView, "show.json", jwt: jwt, user: user)

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(Hb.RegistrationView, "error.json", changeset: changeset)
    end
  end
end
