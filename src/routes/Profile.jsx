import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiAward,
  FiTarget,
  FiTrendingUp,
  FiActivity,
  FiBarChart2,
  FiRefreshCw,
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiShield,
} from "react-icons/fi";

import { fetchLeaderboard } from "../services/gameService";
import {
  PremiumLayout,
  Panel,
  EmptyState,
} from "../components/PremiumLayout";

function getStats(player) {
  const games = Math.max(0, Number(player?.games_played) || 0);
  const wins = Math.max(0, Number(player?.total_wins) || 0);
  const highest = Math.max(0, Number(player?.highest_score) || 0);
  const winRate = games > 0 ? Math.min(100, (wins / games) * 100) : 0;
  return { games, wins, highest, winRate, nonWins: Math.max(0, games - wins) };
}

function getRank(wins) {
  if (wins >= 20) return "Arena Legend";
  if (wins >= 10) return "Champion";
  if (wins >= 5) return "Rising Star";
  if (wins >= 1) return "Contender";
  return "Rookie";
}

export default function Profile() {
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
      console.error("Profile error:", err);
      setError("Unable to load player profiles.");
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
  const rank = getRank(stats.wins);

  const milestones = [
    { title: "First Victory", target: 1, current: stats.wins, icon: FiAward },
    { title: "Rising Star", target: 5, current: stats.wins, icon: FiTrendingUp },
    { title: "Dedicated Player", target: 10, current: stats.games, icon: FiTarget },
    { title: "Century Club", target: 100, current: stats.highest, icon: FiShield },
  ];

  const unlockedCount = milestones.filter((item) => item.current >= item.target).length;

  return (
    <PremiumLayout
      eyebrow="Player Identity"
      title="Player Profile"
      description="View your game identity, track your performance and explore your achievements in the Greedy Pig arena."
    >
      <Panel className="mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-white">Player Directory</h2>
            <p className="mt-1 text-sm text-slate-400">Choose a player to view their profile.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Select player profile"
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </Panel>

      {loading && <p role="status" className="py-12 text-center text-slate-300">Loading player profile...</p>}

      {!loading && error && (
        <Panel>
          <p role="alert" className="text-red-300">{error}</p>
          <button type="button" onClick={loadPlayers} className="mt-4 rounded-xl bg-pink-500 px-5 py-3 font-bold text-white">Try Again</button>
        </Panel>
      )}

      {!loading && !error && !selectedPlayer && (
        <Panel>
          <EmptyState title="No player profiles yet" description="Player profiles will appear here when players are recorded." />
        </Panel>
      )}

      {!loading && !error && selectedPlayer && (
        <>
          <div className="mb-6 overflow-hidden rounded-[24px] border border-pink-400/20 bg-gradient-to-br from-[#3a1d43] via-[#21182f] to-[#171222] p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-pink-400/30 bg-pink-400/15 text-pink-300 shadow-lg">
                <FiUser size={48} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300">{rank}</p>
                <h2 className="mt-2 break-words text-3xl font-black text-white">{selectedPlayer.username || "Unknown Player"}</h2>
              </div>
            </div>
          </div>
        </>
      )}
    </PremiumLayout>
  );
}