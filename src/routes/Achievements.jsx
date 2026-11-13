import { useEffect, useMemo, useState } from "react";
import {
  FiAward,
  FiCheckCircle,
  FiLock,
  FiTarget,
  FiTrendingUp,
  FiZap,
  FiBookOpen,
  FiRefreshCw,
} from "react-icons/fi";

import { fetchLeaderboard } from "../services/gameService";
import {
  PremiumLayout,
  Panel,
  EmptyState,
} from "../components/PremiumLayout";

const achievements = [
  { id: "first-win", title: "First Victory", description: "Win your first Greedy Pig match.", target: 1, metric: "wins", icon: FiAward },
  { id: "five-wins", title: "Rising Star", description: "Win 5 matches.", target: 5, metric: "wins", icon: FiTrendingUp },
  { id: "ten-wins", title: "Arena Champion", description: "Win 10 matches.", target: 10, metric: "wins", icon: FiAward },
  { id: "first-game", title: "Getting Started", description: "Play your first match.", target: 1, metric: "games", icon: FiZap },
  { id: "ten-games", title: "Dedicated Player", description: "Play 10 matches.", target: 10, metric: "games", icon: FiTarget },
  { id: "score-50", title: "Score Hunter", description: "Reach a score of 50 in a match.", target: 50, metric: "score", icon: FiTarget },
  { id: "score-100", title: "Century Club", description: "Reach a score of 100 in a match.", target: 100, metric: "score", icon: FiAward },
  { id: "tutorial", title: "Quick Learner", description: "Complete the interactive tutorial.", target: 1, metric: "tutorial", icon: FiBookOpen },
];

function getPlayerProgress(player, tutorialComplete) {
  return {
    wins: Math.max(0, Number(player?.total_wins) || 0),
    games: Math.max(0, Number(player?.games_played) || 0),
    score: Math.max(0, Number(player?.highest_score) || 0),
    tutorial: tutorialComplete ? 1 : 0,
  };
}

export default function Achievements() {
  const [players, setPlayers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [tutorialComplete, setTutorialComplete] = useState(() => {
    try {
      return localStorage.getItem("greedy-pig-tutorial-complete") === "true";
    } catch {
      return false;
    }
  });

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
      console.error("Achievements error:", err);
      setError("Unable to load player achievements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  function refreshAchievements() {
    try {
      setTutorialComplete(localStorage.getItem("greedy-pig-tutorial-complete") === "true");
    } catch {
      setTutorialComplete(false);
    }
    loadPlayers();
  }

  const selectedPlayer = useMemo(
    () => players.find((player) => String(player.id) === selectedId),
    [players, selectedId]
  );

  const progress = useMemo(
    () => getPlayerProgress(selectedPlayer, tutorialComplete),
    [selectedPlayer, tutorialComplete]
  );

  const achievementResults = useMemo(
    () =>
      achievements.map((achievement) => {
        const current = progress[achievement.metric];
        const unlocked = current >= achievement.target;
        return {
          ...achievement,
          current,
          unlocked,
          percent: Math.min(100, (current / achievement.target) * 100),
        };
      }),
    [progress]
  );

  const unlockedCount = achievementResults.filter((a) => a.unlocked).length;

  const filteredAchievements = achievementResults.filter((achievement) => {
    if (filter === "unlocked") return achievement.unlocked;
    if (filter === "locked") return !achievement.unlocked;
    return true;
  });

  return (
    <PremiumLayout
      eyebrow="Progression"
      title="Achievements"
      description="Celebrate your victories, unlock new milestones and track your progress in the Greedy Pig arena."
    >
      <Panel className="mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-white">Achievement Collection</h2>
            <p className="mt-1 text-sm text-slate-400">Select a player to view their milestones.</p>
          </div>

          <div className="flex flex-wrap gap-3">
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
              onClick={refreshAchievements}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </Panel>

      {loading && <p role="status" className="py-12 text-center text-slate-300">Loading achievements...</p>}

      {!loading && error && (
        <Panel>
          <p role="alert" className="text-red-300">{error}</p>
          <button type="button" onClick={refreshAchievements} className="mt-4 rounded-xl bg-pink-500 px-5 py-3 font-bold text-white">
            Try Again
          </button>
        </Panel>
      )}

      {!loading && !error && !selectedPlayer && (
        <Panel>
          <EmptyState title="No players found" description="Play some matches to start building an achievement collection." />
        </Panel>
      )}

      {!loading && !error && selectedPlayer && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Panel>
              <div className="flex items-center gap-3 text-pink-300">
                <FiAward size={22} />
                <span className="text-sm font-bold">Unlocked</span>
              </div>
              <p className="mt-5 text-3xl font-black text-white">{unlockedCount}</p>
              <p className="mt-1 text-xs text-slate-400">Achievements earned</p>
            </Panel>

            <Panel>
              <div className="flex items-center gap-3 text-violet-300">
                <FiLock size={22} />
                <span className="text-sm font-bold">Locked</span>
              </div>
              <p className="mt-5 text-3xl font-black text-white">{achievements.length - unlockedCount}</p>
              <p className="mt-1 text-xs text-slate-400">Achievements remaining</p>
            </Panel>

            <Panel>
              <div className="flex items-center gap-3 text-teal-300">
                <FiTrendingUp size={22} />
                <span className="text-sm font-bold">Completion</span>
              </div>
              <p className="mt-5 text-3xl font-black text-white">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </p>
              <p className="mt-1 text-xs text-slate-400">Collection completed</p>
            </Panel>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {[
              ["all", "All Achievements"],
              ["unlocked", "Unlocked"],
              ["locked", "Locked"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${
                  filter === value
                    ? "border-pink-400/40 bg-pink-500/20 text-pink-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Panel key={achievement.id} className={achievement.unlocked ? "border-pink-400/25" : "opacity-80"}>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${achievement.unlocked ? "bg-pink-400/15 text-pink-300" : "bg-white/5 text-slate-400"}`}>
                      <Icon size={30} />
                    </div>
                    {achievement.unlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-bold text-teal-300">
                        <FiCheckCircle /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
                        <FiLock /> Locked
                      </span>
                    )}
                  </div>
                  <h3 className="mt-6 text-lg font-black text-white">{achievement.title}</h3>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">{achievement.description}</p>
                </Panel>
              );
            })}
          </div>
        </>
      )}
    </PremiumLayout>
  );
}