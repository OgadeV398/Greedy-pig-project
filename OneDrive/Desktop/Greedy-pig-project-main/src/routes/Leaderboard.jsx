import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import pig from "../assets/pig-0.png";
import {
  PremiumLayout,
  Panel,
  EmptyState,
} from "../components/PremiumLayout";
import {
  FiSearch,
  FiRefreshCw,
  FiAward,
} from "react-icons/fi";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadLeaderboard() {
    setLoading(true);
    setError("");

    try {
      const { data, error: dbError } = await supabase
        .from("players")
        .select("*")
        .order("total_wins", { ascending: false })
        .limit(100);

      if (dbError) throw dbError;

      setPlayers(data || []);
    } catch (err) {
      console.error(err);
      setError(
        "Could not load the leaderboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) =>
      (player.username || "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [players, query]);

  const topPlayers = players.slice(0, 3);

  return (
    <PremiumLayout
      eyebrow="Competition"
      title="Leaderboard"
      description="Meet the top players in the Greedy Pig arena."
    >
      {!loading && !error && topPlayers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {topPlayers.map((player, index) => (
            <Panel
              key={player.id || index}
              className="text-center"
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-400/10 text-2xl">
                {["🥇", "🥈", "🥉"][index]}
              </div>

              <img
                src={pig}
                alt=""
                className="mx-auto h-16 w-16 object-contain"
              />

              <p className="mt-3 truncate font-bold text-white">
                {player.username || "Unknown player"}
              </p>

              <p className="mt-1 text-sm text-pink-300">
                {player.total_wins || 0} wins
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Rank #{index + 1}
              </p>
            </Panel>
          ))}
        </div>
      )}

      <Panel className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FiAward className="text-pink-400" />

              <h2 className="text-xl font-extrabold text-white">
                All Players
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Ranked by total victories
            </p>
          </div>

          <button
            type="button"
            onClick={loadLeaderboard}
            disabled={loading}
            className="gp-button-secondary disabled:opacity-50"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        <label className="mt-6 flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <FiSearch className="text-slate-400" />

          <span className="sr-only">
            Search players
          </span>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
          />
        </label>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200"
          >
            {error}
          </div>
        )}

        {loading && (
          <p className="py-12 text-center text-slate-300">
            Loading leaderboard...
          </p>
        )}

        {!loading && !error && filteredPlayers.length === 0 && (
          <EmptyState
            title="No players found"
            description={
              query
                ? "Try searching for another player."
                : "No leaderboard records are available yet."
            }
          />
        )}

        {!loading && !error && filteredPlayers.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[530px] text-left">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3">Rank</th>
                  <th>Player</th>
                  <th>Wins</th>
                  <th>Highest Score</th>
                  <th>Games</th>
                </tr>
              </thead>

              <tbody>
                {filteredPlayers.map((player) => (
                  <tr
                    key={player.id || player.username}
                    className="border-t border-white/10"
                  >
                    <td className="py-4 font-bold text-pink-300">
                      #{players.indexOf(player) + 1}
                    </td>

                    <td className="font-semibold text-white">
                      {player.username || "Unknown"}
                    </td>

                    <td className="text-slate-200">
                      {player.total_wins || 0}
                    </td>

                    <td className="text-slate-200">
                      {player.highest_score || 0}
                    </td>

                    <td className="text-slate-200">
                      {player.games_played || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PremiumLayout>
  );
}
