const API_URL = 'http://localhost:5000/api';

// Fetch leaderboard data from the Express backend
export async function fetchLeaderboard(search = '', minPoints = '') {
  try {
    const res = await fetch(
      `${API_URL}/leaderboard?search=${encodeURIComponent(search)}&minPoints=${encodeURIComponent(minPoints)}`
    );
    if (!res.ok) throw new Error('Failed to fetch leaderboard data');
    return await res.json();
  } catch (err) {
    console.error('Leaderboard service error:', err);
    return [];
  }
}

// Initialize a new game session on the server
export async function startGame(players) {
  try {
    const res = await fetch(`${API_URL}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    });
    if (!res.ok) throw new Error('Failed to initialize game session');
    return await res.json();
  } catch (err) {
    console.error('Start game service error:', err);
    throw err;
  }
}

// Request a server-side dice roll (Anti-cheat)
export async function rollDice(gameId) {
  try {
    const res = await fetch(`${API_URL}/game/roll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
    });
    if (!res.ok) throw new Error('Failed to roll dice on server');
    return await res.json();
  } catch (err) {
    console.error('Roll dice service error:', err);
    throw err;
  }
}

// Bank turn points and check win condition on the server
export async function holdPoints(gameId) {
  try {
    const res = await fetch(`${API_URL}/game/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
    });
    if (!res.ok) throw new Error('Failed to hold points on server');
    return await res.json();
  } catch (err) {
    console.error('Hold points service error:', err);
    throw err;
  }
}

// Compatibility export for GameOver.jsx
export async function recordMatchResult(winnerName, winningScore, playersList, gameId) {
  try {
    const res = await fetch(`${API_URL}/game/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, winnerName, winningScore, playersList }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error recording match result:', err);
  }
}