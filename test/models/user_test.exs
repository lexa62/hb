defmodule Hb.UserTest do
  use Hb.ModelCase

  alias Hb.User

  @valid_attrs %{email: "some@email.com", password: "some content", first_name: "some content", last_name: "some content"}
  @invalid_attrs %{email: "some email", password: "some content", first_name: "some content", last_name: "some content"}

  test "changeset with valid attributes" do
    changeset = User.changeset(%User{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = User.changeset(%User{}, @invalid_attrs)
    refute changeset.valid?
  end
end
