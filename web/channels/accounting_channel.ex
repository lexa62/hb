defmodule Hb.AccountingChannel do
  require IEx
  use Hb.Web, :channel

  alias Hb.{Repo, User, Accounting, Transaction, AccountingUser, CurrencyBalance,
            Account, FinancialGoal, Account, Currency, Category}

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
        currency_balance =
          case transaction.type do
            :transfer ->
              Repo.all(from a in Account, where: a.id in [^transaction.source_account_id, ^transaction.destination_account_id])
              |> Enum.map(fn(account) ->
                account
                |> assoc(:currency_balances)
                |> Repo.get_by(currency_id: transaction.currency_id) || Repo.insert!(%CurrencyBalance{currency_id: transaction.currency_id, account_id: account.id, initial_amount: Money.new(0), current_amount: Money.new(0)})
                |> CurrencyBalance.calculate_current_amount
                |> Repo.update!
              end)
            _ ->
              Repo.get(Account, transaction.source_account_id)
              |> assoc(:currency_balances)
              |> Repo.get_by(currency_id: transaction.currency_id) || Repo.insert!(%CurrencyBalance{currency_id: transaction.currency_id, account_id: transaction.source_account_id, initial_amount: Money.new(0), current_amount: Money.new(0)})
              |> CurrencyBalance.calculate_current_amount
              |> Repo.update!
          end
        # IEx.pry
        currency_balance = Repo.preload(currency_balance, :currency)
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
        {:ok, accounting_user_schema} ->
          accounting_user = AccountingUser
            |> AccountingUser.preload_all
            |> Repo.get(accounting_user_schema.id)
          broadcast! socket, "member:added", %{user: accounting_user}

          # Hb.Endpoint.broadcast_from! self(), "users:#{user.id}", "accounting:add", %{accounting: accounting}

          {:noreply, socket}
        {:error, _changeset} ->
          {:reply, {:error, %{error: "Error adding new member"}}, socket}
      end
    catch
      _, _-> {:reply, {:error, %{error: "User does not exist"}}, socket}
    end
  end



  def handle_in("financial_goal:add", %{"financial_goal" => financial_goal_params}, socket) do
    current_user = socket.assigns.current_user

    financial_goal = socket.assigns.accounting
      |> build_assoc(:financial_goals)

    changeset = FinancialGoal.changeset(financial_goal, financial_goal_params)

    case Repo.insert(changeset) do
      {:ok, financial_goal_schema} ->
        financial_goal = FinancialGoal
        |> FinancialGoal.preload_all
        |> Repo.get(financial_goal_schema.id)

        broadcast! socket, "financial_goal:created", %{financial_goal: financial_goal}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error creating financial goal"}}, socket}
    end
  end

  def handle_in("financial_goal:update", %{"financial_goal" => financial_goal_params}, socket) do
    financial_goal = socket.assigns.accounting
      |> assoc(:financial_goals)
      |> Repo.get!(financial_goal_params["id"])

    changeset = FinancialGoal.changeset(financial_goal, financial_goal_params)

    case Repo.update(changeset) do
      {:ok, financial_goal} ->
        financial_goal = FinancialGoal
        |> FinancialGoal.preload_all
        |> Repo.get(financial_goal.id)

        broadcast! socket, "financial_goal:updated", %{financial_goal: financial_goal}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error updating financial goal"}}, socket}
    end
  end

  def handle_in("financial_goal:remove", %{"financial_goal_id" => financial_goal_id}, socket) do
    financial_goal = socket.assigns.accounting
      |> assoc(:financial_goals)
      |> Repo.get!(financial_goal_id)

    case Repo.delete(financial_goal) do
      {:ok, financial_goal_schema} ->

        broadcast! socket, "financial_goal:removed", %{financial_goal_id: financial_goal_schema.id}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error removing financial goal"}}, socket}
    end
  end



  def handle_in("account:add", %{"account" => account_params}, socket) do
    current_user = socket.assigns.current_user

    account = socket.assigns.accounting
      |> build_assoc(:accounts)

    changeset = Account.changeset(account, account_params)

    case Repo.insert(changeset) do
      {:ok, account_schema} ->
        account_params["currency_balances"]
        |> Enum.each(fn(currency_balance) ->
          %CurrencyBalance{currency_id: currency_balance["currency_id"], account_id: account_schema.id, initial_amount: Money.parse!(currency_balance["initial_amount"]) |> Money.abs, current_amount: Money.new(0)}
          |> Repo.insert!
          |> CurrencyBalance.calculate_current_amount
          |> Repo.update!
        end)

        account = Account
        |> Account.preload_all
        |> Repo.get(account_schema.id)

        broadcast! socket, "account:created", %{account: account}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error creating account"}}, socket}
    end
  end

  def handle_in("account:update", %{"account" => account_params}, socket) do
    account = socket.assigns.accounting
      |> assoc(:accounts)
      |> Repo.get!(account_params["id"])

    IO.inspect account_params
    account_params["currency_balances"]
    |> Enum.each(fn(currency_balance) ->
      case currency_balance["id"] do
        nil -> %CurrencyBalance{currency_id: currency_balance["currency_id"], account_id: account.id, initial_amount: Money.parse!(currency_balance["initial_amount"]) |> Money.abs}
        id -> Repo.get!(CurrencyBalance, id)
      end
      |> CurrencyBalance.changeset(%{initial_amount: Money.parse!(currency_balance["initial_amount"]) |> Money.abs, current_amount: Money.new(0)})
      |> Repo.insert_or_update!
      |> CurrencyBalance.calculate_current_amount
      |> Repo.update!
    end)

    changeset = Account.changeset(account, account_params)

    case Repo.update(changeset) do
      {:ok, account} ->
        account = Account
        |> Account.preload_all
        |> Repo.get(account.id)

        broadcast! socket, "account:updated", %{account: account}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error updating account"}}, socket}
    end
  end

  def handle_in("account:remove", %{"account_id" => account_id}, socket) do
    account = socket.assigns.accounting
      |> assoc(:accounts)
      |> Repo.get!(account_id)

    transaction_count =
      from(t in Transaction, where: (t.source_account_id == ^(account.id)) or (t.destination_account_id == ^(account.id)))
      |> Repo.aggregate(:count, :id)

    case transaction_count do
      0 ->
        case Repo.delete(account) do
          {:ok, account_schema} ->

            broadcast! socket, "account:removed", %{account_id: account_schema.id}
            {:noreply, socket}
          {:error, _changeset} ->
            {:reply, {:error, %{error: "Error removing financial goal"}}, socket}
        end
      _ ->
        {:reply, {:error, %{error: "Error removing financial goal: transactions exists"}}, socket}
    end
  end



  def handle_in("currency:add", %{"currency" => currency_params}, socket) do
    current_user = socket.assigns.current_user

    currency = socket.assigns.accounting
      |> build_assoc(:currencies)

    changeset = Currency.changeset(currency, currency_params)

    IO.inspect changeset

    case Repo.insert(changeset) do
      {:ok, currency_schema} ->
        currency = Currency
        |> Repo.get(currency_schema.id)

        broadcast! socket, "currency:created", %{currency: currency}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error creating currency"}}, socket}
    end
  end

  def handle_in("currency:update", %{"currency" => currency_params}, socket) do
    currency = socket.assigns.accounting
      |> assoc(:currencies)
      |> Repo.get!(currency_params["id"])


    changeset = Currency.changeset(currency, currency_params)
    IO.inspect changeset
    IO.inspect currency_params

    case Repo.update(changeset) do
      {:ok, currency} ->
        currency = Currency
        |> Repo.get(currency.id)

        broadcast! socket, "currency:updated", %{currency: currency}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error updating currency"}}, socket}
    end
  end

  def handle_in("currency:remove", %{"currency_id" => currency_id}, socket) do
    currency = socket.assigns.accounting
      |> assoc(:currencies)
      |> Repo.get!(currency_id)

    transaction_count =
      from(t in Transaction, where: t.currency_id == ^(currency.id))
      |> Repo.aggregate(:count, :id)

    case transaction_count do
      0 ->
        case Repo.delete(currency) do
          {:ok, currency_schema} ->

            broadcast! socket, "currency:removed", %{currency_id: currency_schema.id}
            {:noreply, socket}
          {:error, _changeset} ->
            {:reply, {:error, %{error: "Error removing currency"}}, socket}
        end
      _ ->
        {:reply, {:error, %{error: "Error removing currency: transactions exists"}}, socket}
    end
  end



  def handle_in("category:add", %{"category" => category_params}, socket) do
    current_user = socket.assigns.current_user
    accounting = socket.assigns.accounting

    category = accounting
      |> build_assoc(:categories)

    changeset = Category.changeset(category, category_params)

    case Repo.insert(changeset) do
      {:ok, category_schema} ->
        categories = accounting
          |> assoc(:categories)
          |> Repo.all

        category = categories
        |> Enum.find(fn c -> c.id == category_schema.id end)

        categories_tree = Accounting.get_categories_tree(categories)

        broadcast! socket, "category:created", %{category: category, categories_tree: categories_tree}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error creating category"}}, socket}
    end
  end

  def handle_in("category:update", %{"category" => category_params}, socket) do
    category = socket.assigns.accounting
      |> assoc(:categories)
      |> Repo.get!(category_params["id"])

    accounting = socket.assigns.accounting

    changeset = Category.changeset(category, category_params)

    case Repo.update(changeset) do
      {:ok, category_schema} ->
        categories = accounting
          |> assoc(:categories)
          |> Repo.all

        category = categories
        |> Enum.find(fn c -> c.id == category_schema.id end)

        categories_tree = Accounting.get_categories_tree(categories)

        broadcast! socket, "category:updated", %{category: category, categories_tree: categories_tree}
        {:noreply, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{error: "Error updating category"}}, socket}
    end
  end

  def handle_in("category:remove", %{"category_id" => category_id}, socket) do
    category = socket.assigns.accounting
      |> assoc(:categories)
      |> Repo.get!(category_id)

    accounting = socket.assigns.accounting

    ids = category
      |> Category.descendants |> Repo.all |> Enum.map(&(&1.id))

    ids_and_self = ids ++ [category.id]

    transaction_count =
      from(t in Transaction, where: t.category_id in ^(ids_and_self))
      |> Repo.aggregate(:count, :id)

    case transaction_count do
      0 ->
        case Repo.delete(category) do
          {:ok, category_schema} ->
            categories = accounting
              |> assoc(:categories)
              |> Repo.all

            # category = categories
            # |> Enum.find(fn c -> c.id == category_schema.id end)

            categories_tree = Accounting.get_categories_tree(categories)

            broadcast! socket, "category:removed", %{category_id: category_schema.id, categories_tree: categories_tree}
            {:noreply, socket}
          {:error, _changeset} ->
            {:reply, {:error, %{error: "Error removing category"}}, socket}
        end
      _ ->
        {:reply, {:error, %{error: "Error removing category: transactions exists"}}, socket}
    end
  end





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
