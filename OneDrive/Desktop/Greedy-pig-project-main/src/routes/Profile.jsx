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

import { supabase } from "../supabaseClient";
import {
  PremiumLayout,
  Panel,
  EmptyState,
} from "../components/PremiumLayout";

function getStats(player) {
  const games = Math.max(
    0,
    Number(player?.games_played) || 0
  );

  const wins = Math.max(
    0,
    Number(player?.total_wins) || 0
  );

  const highest = Math.max(
    0,
    Number(player?.highest_score) || 0
  );

  const winRate =
    games > 0
      ? Math.min(100, (wins / games) * 100)
      : 0;

  return {
    games,
    wins,
    highest,
    winRate,
    nonWins: Math.max(0, games - wins),
  };
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
      const { data, error: dbError } = await supabase
        .from("players")
        .select(
          "id, username, total_wins, games_played, highest_score"
        )
        .order("total_wins", { ascending: false })
        .limit(100);

      if (dbError) throw dbError;

      const records = data || [];
      setPlayers(records);

      setSelectedId((current) => {
        const exists = records.some(
          (player) => String(player.id) === current
        );

        return exists
          ? current
          : records.length > 0
            ? String(records[0].id)
            : "";
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
    () =>
      players.find(
        (player) => String(player.id) === selectedId
      ),
    [players, selectedId]
  );

  const stats = useMemo(
    () => getStats(selectedPlayer),
    [selectedPlayer]
  );

  const rank = getRank(stats.wins);

  const milestones = [
    {
      title: "First Victory",
      target: 1,
      current: stats.wins,
      icon: FiAward,
    },
    {
      title: "Rising Star",
      target: 5,
      current: stats.wins,
      icon: FiTrendingUp,
    },
    {
      title: "Dedicated Player",
      target: 10,
      current: stats.games,
      icon: FiTarget,
    },
    {
      title: "Century Club",
      target: 100,
      current: stats.highest,
      icon: FiShield,
    },
  ];

  const unlockedCount = milestones.filter(
    (item) => item.current >= item.target
  ).length;

  return (
    <PremiumLayout
      eyebrow="Player Identity"
      title="Player Profile"
      description="View your game identity, track your performance and explore your achievements in the Greedy Pig arena."
    >
      <Panel className="mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              Player Directory
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Choose a player to view their profile.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Select player profile"
              value={selectedId}
              onChange={(event) =>
                setSelectedId(event.target.value)
              }
              disabled={loading || players.length === 0}
              className="min-w-[180px] rounded-xl border border-white/15 bg-[#211c30] px-4 py-3 text-sm text-white outline-none focus:border-pink-400 disabled:opacity-50"
            >
              {players.length === 0 && (
                <option value="">No players</option>
              )}

              {players.map((player) => (
                <option
                  key={player.id}
                  value={String(player.id)}
                >
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
              <FiRefreshCw
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </Panel>

      {loading && (
        <p
          role="status"
          className="py-12 text-center text-slate-300"
        >
          Loading player profile...
        </p>
      )}

      {!loading && error && (
        <Panel>
          <p role="alert" className="text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={loadPlayers}
            className="mt-4 rounded-xl bg-pink-500 px-5 py-3 font-bold text-white"
          >
            Try Again
          </button>
        </Panel>
      )}

      {!loading && !error && !selectedPlayer && (
        <Panel>
          <EmptyState
            title="No player profiles yet"
            description="Player profiles will appear here when players are recorded in the database."
          />
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
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300">
                  Greedy Pig Player
                </p>

                <h2 className="mt-2 break-words text-3xl font-black text-white">
                  {selectedPlayer.username ||
                    "Unknown Player"}
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/10 px-4 py-2 text-xs font-bold text-pink-200">
                    <FiAward />
                    {rank}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300">
                    <FiActivity />
                    {stats.games} Games Played
                  </span>
                </div>
              </div>

              <Link
                to="/live-game/setup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-400"
              >
                Play Game
                <FiArrowRight />
              </Link>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total Wins",
                value: stats.wins,
                icon: FiAward,
              },
              {
                title: "Games Played",
                value: stats.games,
                icon: FiActivity,
              },
              {
                title: "Win Rate",
                value: `${stats.winRate.toFixed(1)}%`,
                icon: FiTrendingUp,
              },
              {
                title: "Highest Score",
                value: stats.highest,
                icon: FiTarget,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Panel key={item.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-400/10 text-pink-300">
                    <Icon size={23} />
                  </div>

                  <p className="mt-5 text-3xl font-black text-white">
                    {item.value}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-300">
                    {item.title}
                  </p>
                </Panel>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel>
              <div className="flex items-center gap-3">
                <FiBarChart2
                  className="text-pink-300"
                  size={22}
                />

                <h2 className="text-lg font-extrabold text-white">
                  Performance Overview
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Your recorded match performance.
              </p>

              <div className="mt-7 space-y-6">
                {[
                  {
                    title: "Wins",
                    value: stats.wins,
                    color: "bg-pink-500",
                  },
                  {
                    title: "Non-winning Games",
                    value: stats.nonWins,
                    color: "bg-violet-400",
                  },
                ].map((item) => {
                  const percentage =
                    stats.games > 0
                      ? (item.value / stats.games) * 100
                      : 0;

                  return (
                    <div key={item.title}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-white">
                          {item.title}
                        </span>

                        <span className="text-sm text-slate-400">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/statistics"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-pink-300 hover:text-pink-200"
              >
                View Full Statistics
                <FiArrowRight />
              </Link>
            </Panel>

            <Panel>
              <div className="flex items-center gap-3">
                <FiAward
                  className="text-violet-300"
                  size={22}
                />

                <h2 className="text-lg font-extrabold text-white">
                  Achievement Highlights
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                {unlockedCount} of {milestones.length} featured
                milestones unlocked.
              </p>

              <div className="mt-6 space-y-3">
                {milestones.map((item) => {
                  const Icon = item.icon;
                  const unlocked =
                    item.current >= item.target;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          unlocked
                            ? "bg-pink-400/15 text-pink-300"
                            : "bg-white/5 text-slate-500"
                        }`}
                      >
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {unlocked
                            ? "Unlocked"
                            : `${Math.min(
                                item.current,
                                item.target
                              )}/${item.target} progress`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/achievements"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-pink-300 hover:text-pink-200"
              >
                View All Achievements
                <FiArrowRight />
              </Link>
            </Panel>
          </div>

          <Panel className="mt-6">
            <h2 className="text-lg font-extrabold text-white">
              Explore the Arena
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Match History",
                  path: "/match-history",
                  icon: FiClock,
                },
                {
                  title: "Leaderboard",
                  path: "/leaderboard",
                  icon: FiAward,
                },
                {
                  title: "Tutorial",
                  path: "/tutorial",
                  icon: FiBookOpen,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-white transition hover:border-pink-400/30 hover:bg-pink-400/10"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="text-pink-300" />
                      {item.title}
                    </span>

                    <FiArrowRight className="text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </Panel>

          <p className="mt-5 text-xs leading-6 text-slate-500">
            Player ranks are currently calculated from
            recorded wins. Profiles are view-only until
            player authentication is connected.
          </p>
        </>
      )}
    </PremiumLayout>
  );
}
