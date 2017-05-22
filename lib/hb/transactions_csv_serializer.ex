defmodule TransactionsCsvSerializer do
  require IEx
  defmodule WrongFieldsError do
    defexception message: "Wrong columns count"
  end

  defmodule WrongRowError do
    defexception message: "Wrong row"
  end

  alias NimbleCSV.RFC4180, as: CSV

  alias Hb.{Repo, Transaction, Currency, Account, Category}

  # @default_fields ~w(amount currency)a
  @default_fields ~w(amount currency category account_from account_to exec_at description)a
  # @fields [amount: Money,
  #          currency: String,
  #          category: String,
  #          exec_at: DateTime,
  #          description: String,
  #          author: String]

  def parse_and_save(file_path, accounting_id, author_id) do
    try do
      # Repo.transaction(fn ->
        res = file_path
        |> File.stream!
        |> CSV.parse_stream
        |> Stream.map(fn
          [amount, currency, category, account_from, account_to, exec_at, description] ->
            # currency == "" ? currency.default : currency


            # CONTROLLER
            # TEST
            type = prepare_type(amount, account_to)
            category_id = prepare_category(category, type, accounting_id)
            amount = prepare_amount(amount)
            exec_at = prepare_exec_at(exec_at)
            currency_record_id = prepare_currency(currency, accounting_id)
            account_from_record_id = prepare_account(account_from, accounting_id)
            account_to_record_id = prepare_account(account_to, accounting_id)
            Transaction.changeset(%Transaction{}, %{amount: amount,
                                                    currency_id: currency_record_id,
                                                    source_account_id: account_from_record_id,
                                                    destination_account_id: account_to_record_id,
                                                    accounting_id: accounting_id,
                                                    category_id: category_id,
                                                    author_id: author_id,
                                                    exec_at: exec_at,
                                                    description: description,
                                                    type: type})
            |> Repo.insert!
          _ ->
           raise WrongFieldsError
        end)
        |> Enum.to_list
        |> Enum.count
        # IO.inspect res
        # raise "please rollback it"
      # end)
    rescue
      e in _ ->
        # IEx.pry
        {:error, e}
    end
    #   {:binary.copy(name), String.to_integer(age)}
    # |> Enum.to_list
    # |> Enum.each(fn(t) ->
    #   IO.inspect(elem(t, 0))
    # end)
  end

  def to_csv_string(transactions) do
    # HEADERS
    transactions = Repo.preload(transactions, [:currency, :source_account, :destination_account, :category])
    res = Enum.map(transactions, fn transaction ->
      @default_fields
      |> Enum.map(fn field ->
        serialize(transaction, field)
      end)
    end)
    |> List.insert_at(0, @default_fields)
    # |> CSV.dump_to_stream
    |> CSV.dump_to_iodata
    |> IO.iodata_to_binary
  end

  defp prepare_type(amount, account_to) do
    amount = String.to_integer(amount)
    cond do
      amount > 0 and account_to == "" ->
        :income
      amount < 0 and account_to == "" ->
        :expense
      amount > 0 and account_to != "" ->
        :transfer
      true ->
        raise WrongRowError
    end
  end

  defp prepare_amount(amount) do
    Money.parse!(amount) |> Money.abs
  end

  defp prepare_exec_at(exec_at) do
    if exec_at == "" do
      DateTime.utc_now
    else
      NaiveDateTime.from_iso8601!(exec_at) |> DateTime.from_naive!("Etc/UTC")
    end
  end

  defp prepare_category(name, type, accounting_id) do
    record =
      case name do
        "" ->
          Repo.get_by(Category, name: "Без категории", accounting_id: accounting_id, type: :none) ||
            Repo.insert!(%Category{name: "Без категории", accounting_id: accounting_id, type: :none})
        _ ->
          Category
          |> Repo.get_by(name: name, accounting_id: accounting_id, type: type) ||
            Repo.insert!(%Category{name: name, accounting_id: accounting_id, type: type})
      end
    record.id
  end

  defp prepare_currency(code, accounting_id) do
    record =
      case code do
        "" ->
          Repo.get_by(Currency, accounting_id: accounting_id, is_default: true) ||
            Repo.insert!(%Currency{name: "BYN", iso_code: "BYN", accounting_id: accounting_id, is_default: true})
        _ ->
          Currency
          |> Repo.get_by(iso_code: code, accounting_id: accounting_id) ||
            Repo.insert!(%Currency{name: code, iso_code: code, accounting_id: accounting_id})
      end
    record.id
  end

  defp prepare_account(name, accounting_id) do
    record = Account
    |> Repo.get_by(name: name, accounting_id: accounting_id) ||
      Repo.insert!(%Account{name: name, accounting_id: accounting_id})
    record.id
  end

  defp serialize(transaction, :amount) do
    case transaction.type do
      :expense ->
        transaction.amount |> Money.neg
      _ ->
        transaction.amount
    end
    |> Money.to_string
  end

  defp serialize(transaction, :currency) do
    transaction.currency.iso_code
  end

  defp serialize(transaction, :category) do
    transaction.category.name
  end

  defp serialize(transaction, :account_from) do
    transaction.source_account.name
  end

  defp serialize(transaction, :account_to) do
    transaction.destination_account && transaction.destination_account.name
  end

  defp serialize(transaction, :exec_at) do
    transaction.exec_at |> DateTime.to_naive
  end

  defp serialize(transaction, :description) do
    transaction.description
  end

end

