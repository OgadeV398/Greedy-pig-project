import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import defaultPig from "../assets/pig-0.png";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: playerData, error: playerErr } = await supabase
        .from("players")
        .select("*")
        .order("total_wins", { ascending: false })
        .limit(20);

      if (playerErr) throw playerErr;

      setPlayers(playerData || []);
    } catch (err) {
      console.error("Leaderboard fetch error:", err.message);
      setError("Failed to load leaderboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((p) =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white pri-font text-3xl">
        Loading Stats...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center justify-center space-y-8">
      <h1 className="pri-font text-4xl sm:text-6xl text-[#d30cbc] text-center drop-shadow-md">
        Greedy Pig Leaderboard
      </h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg flex items-center justify-between w-full max-w-xl sec-font">
          <span>{error}</span>
          <button
            onClick={fetchPlayers}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Centered Top Players Section */}
      <div className="w-full max-w-xl bg-[#00000080] border border-[#d30cbc40] p-6 rounded-xl shadow-2xl backdrop-blur-sm flex flex-col justify-between">
        <div>
          <h2 className="pri-font text-2xl text-[#056FA4] mb-4 text-center">
            Top Players
          </h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#111111a0] border border-[#d30cbc40] text-white sec-font text-sm focus:outline-none focus:border-[#d30cbc]"
            />
          </div>

          {filteredPlayers.length === 0 ? (
            <p className="text-gray-400 text-center sec-font py-4">
              {searchQuery ? "No matching players found." : "No records found yet."}
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredPlayers.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between p-3 bg-[#111111a0] rounded-lg border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <span className="pri-font text-[#d30cbc] text-lg w-6">
                      #{idx + 1}
                    </span>
                    <img
                      src={p.avatar || defaultPig}
                      alt={p.username}
                      className="w-10 h-10 rounded-full object-cover border border-[#d30cbc]"
                    />
                    <span className="sec-font font-bold text-lg">
                      {p.username}
                    </span>
                  </div>
                  <div className="text-right sec-font text-sm">
                    <p className="text-[#056FA4] font-semibold">{p.total_wins} Wins</p>
                    <p className="text-xs text-gray-400">High: {p.highest_score} pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link
        to="/"
        className="sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
      >
        Home
      </Link>
    </div>
  );
}