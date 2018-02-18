# Hb

Home accounting app.
Backend based on Phoenix (WebSocket, JSON API, auth with JWT), frontend - React, React Router, Redux.

## Required tools

* erlang
* elixir
* node
* postgres

## To start app:

  * Install frontend dependencies with `npm install`
  * Install elixir dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.create && mix ecto.migrate`
  * Start Phoenix endpoint with `mix phoenix.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Learn more

  * Phoenix: http://www.phoenixframework.org/
  * Elixir: https://elixir-lang.org/
