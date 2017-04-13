defmodule Hb.PageControllerTest do
  use Hb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get conn, "/"
    assert html_response(conn, 200) =~ "Hb"
  end
end
