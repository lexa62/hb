defmodule YahooFinance do
  def exchange_rate_for([first | second], cached \\ true) do
    case cached do
      true ->
        Cachex.get(:cache, "#{first}/#{second}", [fallback: fn(key) ->
          key |> String.split("/") |> YahooFinance.exchange_rate_for(false)
        end])
      _ ->
        fetch(first, second) |> parse_response
    end
  end

  defp url_for_params(first, second) do
    "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22#{first}#{second}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"
  end

  defp fetch(first, second) do
    url_for_params(first, second) |> HTTPoison.get!
  end

  defp parse_response(response) do
    json_map = response.body |> Poison.decode!
    json_map["query"]["results"]["rate"]["Rate"] |> String.to_float
  end
end
