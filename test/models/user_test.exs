defmodule Hb.UserTest do
  use Hb.ModelCase

  alias Hb.User

  @valid_attrs %{email: "some@email.com",
                 password: "secret",
                 first_name: "first name",
                 last_name: "last name"}

  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = User.changeset(%User{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = User.changeset(%User{}, @invalid_attrs)
    refute changeset.valid?
  end

  test "password must be at least 5 characters long" do
    attrs = %{@valid_attrs | password: "1"}
    assert {:password, "should be at least 5 character(s)"} in errors_on(%User{}, attrs)
  end

  test "email should contain @" do
    attrs = %{@valid_attrs | email: "email"}
    assert {:email, "has invalid format"} in errors_on(%User{}, attrs)
  end
end
