import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Fetch top players ordered by total wins
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("*")
          .order("total_wins", { ascending: false })
          .limit(10);

        if (playerError) throw playerError;

        // Fetch recent match history
        const { data: matchData, error: matchError } = await supabase
          .from("match_results")
          .select("*")
          .order("played_at", { ascending: false })
          .limit(10);

        if (matchError) throw matchError;

        setPlayers(playerData || []);
        setMatches(matchData || []);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-20 text-2xl">Loading Leaderboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-pink-500">Greedy Pig Leaderboard</h1>
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Top Players Table */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400">Top Players</h2>
          {players.length === 0 ? (
            <p className="text-slate-400">No players recorded yet. Play a live game!</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-2">Player</th>
                  <th className="py-2 text-center">Wins</th>
                  <th className="py-2 text-center">High Score</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={p.id} className="border-b border-slate-700/50">
                    <td className="py-3 font-medium">{idx + 1}. {p.username}</td>
                    <td className="py-3 text-center">{p.total_wins}</td>
                    <td className="py-3 text-center">{p.highest_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Match History */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400">Recent Matches</h2>
          {matches.length === 0 ? (
            <p className="text-slate-400">No match history yet.</p>
          ) : (
            <ul className="space-y-3">
              {matches.map((m) => (
                <li key={m.id} className="bg-slate-700/50 p-3 rounded flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-pink-300">{m.winner_name}</span> won with <span className="text-green-400">{m.winning_score} pts</span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    {new Date(m.played_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}