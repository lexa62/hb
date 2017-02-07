# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :hb,
  ecto_repos: [Hb.Repo]

# Configures the endpoint
config :hb, Hb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "ecCOpt+HPlvtYPAtK6tX3JM9983IBdZLIcSJVR0T22peefYbiPaGr3K4bN25Dtmp",
  render_errors: [view: Hb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Hb.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"