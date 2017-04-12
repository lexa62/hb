defmodule Hb.AccountingChannel do
  require IEx
  use Hb.Web, :channel

  alias Hb.{Repo, User, Accounting, Transaction, AccountingUser, CurrencyBalance, Account}

  def join("accounting:" <> accounting_id, _params, socket) do
    # current_user = socket.assigns.current_user
    accounting = get_current_accounting(socket, accounting_id)
    {:ok, %{accounting: accounting}, assign(socket, :accounting, accounting)}
  end

  def handle_in("transactions:create", %{"transaction" => transaction_params}, socket) do
    accounting = socket.assigns.accounting
    current_user = socket.assigns.current_user

    transaction_params = transaction_params
    |> Map.put("author_id", current_user.id)

    changeset = accounting
      |> build_assoc(:transactions)
      |> Transaction.changeset(transaction_params)

    case Repo.insert(changeset) do
      {:ok, transaction} ->
        transaction = Repo.preload(transaction, :currency)
        currency_balance = nil
        case transaction.type do
          :transfer ->
            Repo.all(from a in Account, where: a.id in [^transaction.source_account_id, ^transaction.destination_account_id])
            |> Enum.each(fn(account) ->
              currency_balance = account
              |> assoc(:currency_balances)
              |> Repo.get_by(currency_id: transaction.currency_id) || Repo.insert!(%CurrencyBalance{currency_id: transaction.currency_id, account_id: account.id, initial_amount: Money.new(0), current_amount: Money.new(0)})
              |> CurrencyBalance.calculate_current_amount
              |> Repo.update!
              |> Repo.preload(:currency)
            end)
          _ ->
            currency_balance = Repo.get(Account, transaction.source_account_id)
            |> assoc(:currency_balances)
            |> Repo.get_by(currency_id: transaction.currency_id) || Repo.insert!(%CurrencyBalance{currency_id: transaction.currency_id, account_id: transaction.source_account_id, initial_amount: Money.new(0), current_amount: Money.new(0)})
            |> CurrencyBalance.calculate_current_amount
            |> Repo.update!
            |> Repo.preload(:currency)
        end
        broadcast! socket, "transaction:created", %{transaction: transaction, currency_balance: currency_balance}
        {:noreply, socket}
      {:error, changeset} ->
        errors = Enum.map(changeset.errors, fn {field, detail} ->
          %{} |> Map.put(field, detail)
        end)
        {:reply, {:error, %{error: "Error creating transaction", reasons: errors}}, socket}
    end
  end

  # def handle_info({:after_join, connected_users}, socket) do
  #   broadcast! socket, "user:joined", %{users: connected_users}
  #   {:noreply, socket}
  # end

  # def handle_in("lists:create", %{"list" => list_params}, socket) do
  #   accounting = socket.assigns.accounting

  #   changeset = accounting
  #     |> build_assoc(:lists)
  #     |> List.changeset(list_params)

  #   case Repo.insert(changeset) do
  #     {:ok, list} ->
  #       list = Repo.preload(list, [:accounting, :cards])

  #       broadcast! socket, "list:created", %{list: list}
  #       {:noreply, socket}
  #     {:error, _changeset} ->
  #       {:reply, {:error, %{error: "Error creating list"}}, socket}
  #   end
  # end

  # def handle_in("cards:create", %{"card" => card_params}, socket) do
  #   accounting = socket.assigns.accounting
  #   changeset = accounting
  #     |> assoc(:lists)
  #     |> Repo.get!(card_params["list_id"])
  #     |> build_assoc(:cards)
  #     |> Card.changeset(card_params)

  #   case Repo.insert(changeset) do
  #     {:ok, card} ->
  #       card = accounting
  #         |> assoc(:cards)
  #         |> Card.preload_all
  #         |> Repo.get!(card.id)

  #       broadcast! socket, "card:created", %{card: card}
  #       {:noreply, socket}
  #     {:error, _changeset} ->
  #       {:reply, {:error, %{error: "Error creating card"}}, socket}
  #   end
  # end

  def handle_in("members:add", %{"email" => email}, socket) do
    try do
      accounting = socket.assigns.accounting
      user = User
      |> Repo.get_by(email: email)

      changeset = user
      |> build_assoc(:accounting_users)
      |> AccountingUser.changeset(%{accounting_id: accounting.id})

      case Repo.insert(changeset) do
        {:ok, _accounting_user} ->
          broadcast! socket, "member:added", %{user: user}

          # Hb.Endpoint.broadcast_from! self(), "users:#{user.id}", "accounting:add", %{accounting: accounting}

          {:noreply, socket}
        {:error, _changeset} ->
          {:reply, {:error, %{error: "Error adding new member"}}, socket}
      end
    catch
      _, _-> {:reply, {:error, %{error: "User does not exist"}}, socket}
    end
  end

  # def handle_in("card:update", %{"card" => card_params}, socket) do
  #   card = socket.assigns.accounting
  #     |> assoc(:cards)
  #     |> Repo.get!(card_params["id"])

  #   changeset = Card.update_changeset(card, card_params)

  #   case Repo.update(changeset) do
  #     {:ok, card} ->
  #       accounting = get_current_accounting(socket)

  #       card = Card
  #       |> Card.preload_all
  #       |> Repo.get(card.id)

  #       broadcast! socket, "card:updated", %{accounting: accounting, card: card}
  #       {:noreply, socket}
  #     {:error, _changeset} ->
  #       {:reply, {:error, %{error: "Error updating card"}}, socket}
  #   end
  # end

  # def handle_in("list:update", %{"list" => list_params}, socket) do
  #   list = socket.assigns.accounting
  #     |> assoc(:lists)
  #     |> Repo.get!(list_params["id"])

  #   changeset = List.update_changeset(list, list_params)

  #   case Repo.update(changeset) do
  #     {:ok, _list} ->
  #       accounting = get_current_accounting(socket)
  #       broadcast! socket, "list:updated", %{accounting: accounting}
  #       {:noreply, socket}
  #     {:error, _changeset} ->
  #       {:reply, {:error, %{error: "Error updating list"}}, socket}
  #   end
  # end

  # def handle_in("card:add_comment", %{"card_id" => card_id, "text" => text}, socket) do
  #   current_user = socket.assigns.current_user

  #   comment = socket.assigns.accounting
  #     |> assoc(:cards)
  #     |> Repo.get!(card_id)
  #     |> build_assoc(:comments)

  #   changeset = Comment.changeset(comment, %{text: text, user_id: current_user.id})

  #   case Repo.insert(changeset) do
  #     {:ok, _comment} ->
  #       card = Card
  #       |> Card.preload_all
  #       |> Repo.get(card_id)

  #       broadcast! socket, "comment:created", %{accounting: get_current_accounting(socket), card: card}
  #       {:noreply, socket}
  #     {:error, _changeset} ->
  #       {:reply, {:error, %{error: "Error creating comment"}}, socket}
  #   end
  # end

  # def handle_in("card:add_member", %{"card_id" => card_id, "user_id" => user_id}, socket) do
  #   try do
  #     current_accounting = socket.assigns.accounting

  #     card_member = current_accounting
  #       |> assoc(:cards)
  #       |> Repo.get!(card_id)
  #       |> build_assoc(:card_members)

  #     user_accounting = UserBoard
  #       |> UserBoard.find_by_user_and_accounting(user_id, current_accounting.id)
  #       |> Repo.one!()

  #     changeset = CardMember.changeset(card_member, %{user_accounting_id: user_accounting.id})

  #     case Repo.insert(changeset) do
  #       {:ok, _} ->
  #         card = Card
  #         |> Card.preload_all
  #         |> Repo.get(card_id)

  #         broadcast! socket, "card:updated", %{accounting: get_current_accounting(socket), card: card}
  #         {:noreply, socket}
  #       {:error, _} ->
  #         {:reply, {:error, %{error: "Error adding new member"}}, socket}
  #     end
  #   catch
  #     _, _-> {:reply, {:error, %{error: "Member does not exist"}}, socket}
  #   end
  # end

  # def handle_in("card:remove_member", %{"card_id" => card_id, "user_id" => user_id}, socket) do
  #   current_accounting = socket.assigns.accounting

  #   user_accounting = UserBoard
  #     |> UserBoard.find_by_user_and_accounting(user_id, current_accounting.id)
  #     |> Repo.one!

  #   card_member = CardMember
  #     |> CardMember.get_by_card_and_user_accounting(card_id, user_accounting.id)
  #     |> Repo.one!

  #   case Repo.delete(card_member) do
  #     {:ok, _} ->
  #       card = Card
  #       |> Card.preload_all
  #       |> Repo.get(card_id)

  #       broadcast! socket, "card:updated", %{accounting: get_current_accounting(socket), card: card}
  #       {:noreply, socket}
  #     {:error, _changeset} ->
  #       {:reply, {:error, %{error: "Error creating comment"}}, socket}
  #   end
  # end

  # def terminate(_reason, socket) do
  #   accounting_id = Board.slug_id(socket.assigns.accounting)
  #   user_id = socket.assigns.current_user.id

  #   broadcast! socket, "user:left", %{users: Monitor.user_left(accounting_id, user_id)}

  #   :ok
  # end

  defp get_current_accounting(socket, accounting_id) do
    socket.assigns.current_user
    |> assoc(:all_accounting)
    |> Accounting.preload_all
    |> Repo.get(accounting_id)
  end

  # defp get_current_accounting(socket), do: get_current_accounting(socket, socket.assigns.accounting.id)
end
