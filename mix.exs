defmodule Hb.Mixfile do
  use Mix.Project

  def project do
    [app: :hb,
     version: "1.0.0",
     elixir: "~> 1.2",
     description: "Hb release deb",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [:phoenix, :gettext] ++ Mix.compilers,
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     aliases: aliases(),
     deps: deps(),
     package: package()]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [mod: {Hb, []},
     applications: [:phoenix, :phoenix_pubsub, :phoenix_html, :cowboy, :logger, :gettext,
                    :phoenix_ecto, :postgrex, :comeonin, :httpoison, :cachex, :arbor,
                    :nimble_csv, :filterable, :money, :ecto_enum, :guardian, :exrm_deb, :elixir_make]]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "web", "test/support"]
  defp elixirc_paths(_),     do: ["lib", "web"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [{:phoenix, "~> 1.2.1"},
     {:phoenix_pubsub, "~> 1.0"},
     {:phoenix_ecto, "~> 3.0"},
     {:postgrex, ">= 0.0.0"},
     {:phoenix_html, "~> 2.6"},
     {:phoenix_live_reload, "~> 1.0", only: :dev},
     {:gettext, "~> 0.11"},
     {:cowboy, "~> 1.0"},
     {:comeonin, "~> 3.0"},
     {:guardian, "~> 0.14"},
     {:ecto_enum, "~> 1.0"},
     {:httpoison, "~> 0.11.1"},
     {:cachex, "~> 2.1"},
     {:money, "~> 1.2.1"},
     {:currencies, "~> 0.5.1"},
     {:arbor, "~> 1.0.3"},
     {:nimble_csv, "~> 0.1.0"},
     {:filterable, "~> 0.5.2"},
     {:exrm, "~> 1.0"},
     {:distillery, "~> 1.4"},
     {:exrm_deb, github: "johnhamelink/exrm_deb", branch: "feature/distillery-support"}]
  end

  def package do
    [
      maintainer_scripts: [],
      external_dependencies: [],
      license_file: "LICENSE",
      files: [ "lib", "priv", "mix.exs", "README*", "LICENSE"],
      maintainers: ["Aleksey Alekhine <lexa62@tut.by>"],
      licenses: ["MIT"],
      vendor: "Aleksey Alekhine",
      config_files: [],
      links:  %{
        "GitHub" => "https://gitlab.com/lexa62/hb",
        "Docs" => "https://hexdocs.pm/exrm_deb",
        "Homepage" => "https://gitlab.com/lexa62/hb"
      }
    ]
  end

  def lsb_release do
    {release, _} = System.cmd("lsb_release", ["-c", "-s"])
    String.replace(release, "\n", "")
    "jessie"
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    ["ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
     "ecto.reset": ["ecto.drop", "ecto.setup"],
     "test": ["ecto.create --quiet", "ecto.migrate", "test"]]
  end
end
