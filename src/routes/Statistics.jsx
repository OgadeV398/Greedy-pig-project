import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import { fetchLeaderboard } from "../services/gameService";
import {
  PremiumLayout,
  Panel,
  EmptyState,
} from "../components/PremiumLayout";

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    pink: "bg-pink-400/10 text-pink-300",
    purple: "bg-violet-400/10 text-violet-300",
    teal: "bg-teal-400/10 text-teal-300",
  };

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color] || colors.pink}`}>
          <Icon size={23} />
        </div>
        <FiTrendingUp className="text-slate-600" />
      </div>
      <p className="mt-5 text-3xl font-black text-white">{value}</p>
      <h3 className="mt-2 text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </Panel>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
};

function getStats(player) {
  const games = Math.max(0, Number(player?.games_played) || 0);
  const wins = Math.max(0, Number(player?.total_wins) || 0);
  const losses = Math.max(0, games - wins);
  const highest = Math.max(0, Number(player?.highest_score) || 0);
  const winRate = games > 0 ? Math.min(100, (wins / games) * 100) : 0;
  return { games, wins, losses, highest, winRate };
}

export default function Statistics() {
  const [players, setPlayers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPlayers() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchLeaderboard();
      const records = data || [];
      setPlayers(records);

      setSelectedId((current) => {
        const exists = records.some((player) => String(player.id) === current);
        return exists ? current : records.length > 0 ? String(records[0].id) : "";
      });
    } catch (err) {
      console.error("Statistics error:", err);
      setError("Unable to load player statistics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  const selectedPlayer = useMemo(
    () => players.find((player) => String(player.id) === selectedId),
    [players, selectedId]
  );

  const stats = useMemo(() => getStats(selectedPlayer), [selectedPlayer]);
  const topPlayers = players.slice(0, 5);

  return (
    <PremiumLayout
      eyebrow="Competition"
      title="Player Statistics"
      description="Explore your game performance, track victories and compare players in the Greedy Pig arena."
    >
      <Panel className="mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-white">Player Overview</h2>
            <p className="mt-1 text-sm text-slate-400">Select a player to explore their statistics.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Select player"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={loading || players.length === 0}
              className="min-w-[180px] rounded-xl border border-white/15 bg-[#211c30] px-4 py-3 text-sm text-white outline-none focus:border-pink-400 disabled:opacity-50"
            >
              {players.length === 0 && <option value="">No players</option>}
              {players.map((player) => (
                <option key={player.id} value={String(player.id)}>
                  {player.username || "Unknown player"}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadPlayers}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </Panel>

      {loading && <p role="status" className="py-12 text-center text-slate-300">Loading player statistics...</p>}

      {!loading && error && (
        <Panel>
          <p role="alert" className="text-red-300">{error}</p>
          <button type="button" onClick={loadPlayers} className="mt-4 rounded-xl bg-pink-500 px-5 py-2.5 font-bold text-white">Try Again</button>
        </Panel>
      )}

      {!loading && !error && !selectedPlayer && (
        <Panel>
          <EmptyState title="No player statistics yet" description="Player statistics will appear here when game results are recorded." />
        </Panel>
      )}

      {!loading && !error && selectedPlayer && (
        <>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-pink-300">Viewing player</p>
            <h2 className="mt-2 text-2xl font-black text-white">{selectedPlayer.username || "Unknown player"}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Games Played" value={stats.games} subtitle="Total recorded games" icon={FiActivity} color="purple" />
            <StatCard title="Total Wins" value={stats.wins} subtitle="Matches won" icon={FiAward} color="pink" />
            <StatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} subtitle="Percentage of games won" icon={FiTarget} color="teal" />
            <StatCard title="Highest Score" value={stats.highest} subtitle="Personal best score" icon={FiBarChart2} color="pink" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
                <FiUsers className="text-violet-300" /> Top Player Comparison
              </h2>
              <p className="mt-2 text-sm text-slate-400">Players ranked by total victories.</p>

              <div className="mt-7 space-y-5">
                {topPlayers.map((player, index) => {
                  const wins = Math.max(0, Number(player.total_wins) || 0);
                  const maximum = Math.max(1, ...topPlayers.map((item) => Number(item.total_wins) || 0));
                  const width = (wins / maximum) * 100;

                  return (
                    <div key={player.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-white">
                          <span className="mr-2 text-pink-300">#{index + 1}</span>
                          {player.username || "Unknown"}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">{wins} wins</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-400" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </>
      )}
    </PremiumLayout>
  );
}