const API_BASE = "https://greedy-pig-backend.onrender.com/";
const DEFAULT_DUMMY_LEADERBOARD = [
  { id: 1, name: "Oreo", total_victories: 5, total_score: 450, avatar: "" },
  { id: 2, name: "Rosie", total_victories: 3, total_score: 320, avatar: "" },
  { id: 3, name: "Maggie", total_victories: 2, total_score: 280, avatar: "" },
  { id: 4, name: "Jill", total_victories: 2, total_score: 240, avatar: "" },
  { id: 5, name: "Lulu", total_victories: 1, total_score: 190, avatar: "" },
  { id: 6, name: "Esmeralda", total_victories: 1, total_score: 150, avatar: "" }
];

export async function startGame(players, targetScore = 100, level = 1) {
  try {
    const res = await fetch(`${API_BASE}/game/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players, maxPoints: targetScore, level }),
    });
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();
    const game = data.game || data.gameState || {};

    return {
      gameId: data.game_id || data.gameId,
      targetScore: game.maxPoints || game.targetScore || targetScore,
      level: game.level || level,
      players: game.players?.map((player, index) => ({
        ...(players[index] || {}),
        ...player,
        score: Number(player.total_points ?? player.score ?? 0),
        runningScore: Number(player.running_points ?? player.runningScore ?? 0),
      })) || players,
    };
  } catch (err) {
    return {
      gameId: "local-session-" + Date.now(),
      targetScore,
      level,
      players: players.map((p, i) => ({
        id: i + 1,
        name: (typeof p === "string" ? p : p.name) || `Player ${i + 1}`,
        avatar: p.avatar || "",
        score: 0,
        runningScore: 0
      }))
    };
  }
}

export async function rollDice(gameId) {
  const res = await fetch(`${API_BASE}/game/roll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId }),
  });
  if (!res.ok) throw new Error("Backend offline");
  const data = await res.json();
  const state = data.game || data.gameState || data;

  return {
    diceValue: data.die ?? data.diceRoll ?? data.diceValue,
    players: state.players?.map(p => ({
      ...p,
      score: Number(p.total_points ?? p.totalScore ?? p.score ?? 0),
      runningScore: Number(p.running_points ?? p.turnScore ?? p.runningScore ?? 0),
    })),
    currentPlayer: state.currentPlayer ?? state.currentPlayerIndex ?? 0,
    isGameOver: state.status ? state.status === "finished" : state.isGameOver ?? false,
  };
}

export async function holdPoints(gameId, payload = {}) {
  const res = await fetch(`${API_BASE}/game/hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, ...payload }),
  });
  if (!res.ok) throw new Error("Backend offline");
  const data = await res.json();
  const state = data.game || data.gameState || data;

  return {
    ...data,
    gameState: state,
    players: state?.players?.map(p => ({
      ...p,
      score: Number(p.total_points ?? p.totalScore ?? p.score ?? 0),
      runningScore: Number(p.running_points ?? p.turnScore ?? p.runningScore ?? 0),
    })),
    currentPlayer: state?.currentPlayer ?? state?.currentPlayerIndex ?? 0,
    isGameOver: state?.status ? state.status === "finished" : state?.isGameOver ?? Boolean(data.success),
  };
}

/**
 * Fetch leaderboard ensuring local storage wins take precedence and display instantly
 */
export async function getLeaderboard() {
  let backendData = [];
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (res.ok) {
      backendData = await res.json();
    }
  } catch (err) {
    console.warn("Backend offline, loading local leaderboard cache.");
  }
  return mergeWithLocalWins(backendData);
}

function mergeWithLocalWins(backendRecords = []) {
  const localWins = JSON.parse(localStorage.getItem("greedy_pig_leaderboard") || "[]");
  
  // Create a map to combine backend records and local wins seamlessly
  const map = new Map();

  // Add backend records first
  for (const row of backendRecords) {
    const name = (row.name || row.username || "").trim();
    if (name) {
      map.set(name.toLowerCase(), {
        name,
        username: name,
        total_victories: Number(row.total_victories ?? row.total_wins ?? 0),
        total_wins: Number(row.total_victories ?? row.total_wins ?? 0),
        total_score: Number(row.total_score ?? row.highest_score ?? 0),
        highest_score: Number(row.highest_score ?? row.total_score ?? 0),
        avatar: row.avatar || ""
      });
    }
  }

  // Overlay / add local wins (ensuring immediate visibility)
  for (const local of localWins) {
    const name = (local.name || local.username || "").trim();
    if (name) {
      const existing = map.get(name.toLowerCase());
      if (existing) {
        existing.total_victories = Math.max(existing.total_victories, Number(local.total_victories || local.total_wins || 1));
        existing.total_wins = existing.total_victories;
        existing.total_score = Math.max(existing.total_score, Number(local.total_score || 0));
        existing.highest_score = Math.max(existing.highest_score, Number(local.total_score || 0));
        if (local.avatar) existing.avatar = local.avatar;
      } else {
        map.set(name.toLowerCase(), {
          name,
          username: name,
          total_victories: Number(local.total_victories || local.total_wins || 1),
          total_wins: Number(local.total_victories || local.total_wins || 1),
          total_score: Number(local.total_score || 0),
          highest_score: Number(local.total_score || 0),
          avatar: local.avatar || ""
        });
      }
    }
  }

  // Ensure default dummy records exist if list is sparse
  for (const dummy of DEFAULT_DUMMY_LEADERBOARD) {
    if (!map.has(dummy.name.toLowerCase())) {
      map.set(dummy.name.toLowerCase(), {
        name: dummy.name,
        username: dummy.name,
        total_victories: dummy.total_victories,
        total_wins: dummy.total_victories,
        total_score: dummy.total_score,
        highest_score: dummy.total_score,
        avatar: dummy.avatar || ""
      });
    }
  }

  // Sort descending by total victories, then total score
  return Array.from(map.values()).sort((a, b) => {
    if (b.total_victories !== a.total_victories) {
      return b.total_victories - a.total_victories;
    }
    return (b.total_score || 0) - (a.total_score || 0);
  });
}

export function saveLocalWin(winnerName, score, avatar) {
  const cleanName = (winnerName || "").trim();
  if (!cleanName || cleanName.toLowerCase() === "unknown player") return;

  const current = JSON.parse(localStorage.getItem("greedy_pig_leaderboard") || "[]");
  const existing = current.find(p => (p.name || p.username || "").toLowerCase() === cleanName.toLowerCase());
  
  if (existing) {
    existing.total_victories = (existing.total_victories || existing.total_wins || 0) + 1;
    existing.total_wins = existing.total_victories;
    existing.total_score = (existing.total_score || 0) + score;
    existing.highest_score = Math.max(existing.highest_score || 0, score);
    if (avatar) existing.avatar = avatar;
  } else {
    current.push({
      id: Date.now(),
      name: cleanName,
      username: cleanName,
      total_victories: 1,
      total_wins: 1,
      total_score: score,
      highest_score: score,
      avatar: avatar || ""
    });
  }
  
  localStorage.setItem("greedy_pig_leaderboard", JSON.stringify(current));
}

export async function getMatchHistory() {
  try {
    const res = await fetch(`${API_BASE}/match-history`);
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();
    return data.length > 0 ? data : getLocalMatchHistoryFallback();
  } catch (err) {
    return getLocalMatchHistoryFallback();
  }
}

function getLocalMatchHistoryFallback() {
  return JSON.parse(localStorage.getItem("greedy_pig_match_history") || "[]");
}

export function saveLocalMatch(matchData) {
  const current = JSON.parse(localStorage.getItem("greedy_pig_match_history") || "[]");
  current.unshift({
    id: Date.now(),
    date: new Date().toLocaleDateString(),
    ...matchData
  });
  localStorage.setItem("greedy_pig_match_history", JSON.stringify(current.slice(0, 20)));
}

export const fetchLeaderboard = getLeaderboard;
export const fetchMatchHistory = getMatchHistory;