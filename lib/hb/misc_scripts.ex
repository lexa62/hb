defmodule Service.MiscScripts do
  def convert_to_string_map(map), do: to_string_map(map)

  defp transform_key(key = %Hb.Category{}), do: key.name
  defp transform_key(key) when is_atom(key), do: Atom.to_string(key)

  defp to_string_map(v = %Money{}), do: Money.to_string(v)
  defp to_string_map(map) when is_map(map), do: Map.new(map, fn {k,v} -> {transform_key(k), to_string_map(v)} end)
  defp to_string_map(v), do: v

  def initialized_map(map, keys) do
    Enum.reduce(keys, {[], map}, fn(key, acc) ->
      res = elem(acc, 0) ++ [key]
      map = elem(acc, 1)
      map =
        case get_in(map, res) do
          nil ->
            put_in(map, res, %{})
          _ ->
            map
        end
      {res, map}
    end) |> elem(1)
  end
end
