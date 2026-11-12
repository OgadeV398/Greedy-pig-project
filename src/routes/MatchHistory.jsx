import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiAward,
  FiUsers,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";

import { fetchMatchHistory } from "../services/gameService";
import {
  PremiumLayout,
  Panel,
  EmptyState,
} from "../components/PremiumLayout";

function formatDate(dateString) {
  if (!dateString) return "Date unavailable";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatPlayers(players) {
  if (Array.isArray(players)) return players.join(", ");
  if (typeof players === "string") return players.replace(/[{}"]/g, "");
  return "Participants unavailable";
}

export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchMatchHistory();
      setMatches(data || []);
    } catch (err) {
      console.error("Match history error:", err);
      setError("Unable to load match history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const filteredMatches = useMemo(() => {
    const result = matches.filter((match) => {
      const winner = String(match.winner_name || "").toLowerCase();
      const participants = formatPlayers(match.all_players).toLowerCase();
      const term = search.toLowerCase().trim();
      return winner.includes(term) || participants.includes(term);
    });

    return result.sort((a, b) => {
      if (sortBy === "highest") {
        return Number(b.winning_score || 0) - Number(a.winning_score || 0);
      }
      const dateA = new Date(a.played_at || 0).getTime();
      const dateB = new Date(b.played_at || 0).getTime();
      return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [matches, search, sortBy]);

  return (
    <PremiumLayout
      eyebrow="Competition"
      title="Match History"
      description="Look back at completed matches, winning scores and the players who competed."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-400/10 text-pink-300">
              <FiClock size={23} />
            </span>
            <span className="text-xs text-slate-400">Recorded matches</span>
          </div>
          <p className="mt-5 text-3xl font-black text-white">{loading ? "..." : matches.length}</p>
          <p className="mt-1 text-sm text-slate-400">Recent matches loaded</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
              <FiAward size={23} />
            </span>
            <span className="text-xs text-slate-400">Best result</span>
          </div>
          <p className="mt-5 text-3xl font-black text-white">
            {loading || matches.length === 0 ? "—" : Math.max(...matches.map((m) => Number(m.winning_score || 0)))}
          </p>
          <p className="mt-1 text-sm text-slate-400">Highest winning score in loaded matches</p>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
              <FiClock className="text-pink-400" /> Recent Matches
            </h2>
            <p className="mt-2 text-sm text-slate-400">Browse your game&apos;s recorded results</p>
          </div>

          <button
            type="button"
            onClick={loadMatches}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <FiSearch className="shrink-0 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search winners or players..."
              className="min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="relative flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-transparent pr-8 text-sm text-white outline-none md:w-40 [&>option]:bg-[#211c30]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-4 text-slate-400" />
          </label>
        </div>

        {loading && <div role="status" className="py-16 text-center text-sm text-slate-300">Loading match history...</div>}

        {!loading && error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
            {error}
            <button type="button" onClick={loadMatches} className="mt-3 block font-bold underline">Try again</button>
          </div>
        )}

        {!loading && !error && filteredMatches.length === 0 && (
          <EmptyState title="No matches found" description="Completed matches will appear here once recorded." />
        )}

        {!loading && !error && filteredMatches.length > 0 && (
          <div className="mt-6 space-y-4">
            {filteredMatches.map((match, index) => (
              <article key={match.id ?? index} className="rounded-2xl border border-white/10 bg-[#191626] p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-400/10 text-pink-300">
                      <FiAward size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-300">Match Winner</p>
                      <h3 className="mt-1 break-words text-lg font-extrabold text-white">{match.winner_name || "Unknown winner"}</h3>
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <FiCalendar /> {formatDate(match.played_at)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-pink-400/15 bg-pink-400/10 px-5 py-3 sm:text-right">
                    <p className="text-xs text-pink-200">Winning Score</p>
                    <p className="mt-1 text-2xl font-black text-white">{match.winning_score ?? "—"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </PremiumLayout>
  );
}