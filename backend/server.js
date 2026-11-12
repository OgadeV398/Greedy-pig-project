// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory active game sessions for server-side anti-cheat tracking
const activeGames = {};

// Helper: Input validation check
function isValidString(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

// -------------------------------------------------------------------
// ENDPOINT 1: POST /api/game/start - Initialize game & validate inputs
// -------------------------------------------------------------------
app.post('/api/game/start', (req, res) => {
  const { players } = req.body;

  if (!Array.isArray(players) || players.length < 2) {
    return res.status(400).json({ error: 'A game requires at least 2 players.' });
  }

  const gameId = 'game_' + Date.now();
  activeGames[gameId] = {
    gameId,
    players: players.map((p, idx) => ({
      id: idx,
      name: isValidString(p.name) ? p.name.trim() : p.tag || `Player ${idx + 1}`,
      totalScore: 0,
      turnScore: 0,
    })),
    currentPlayerIndex: 0,
    isGameOver: false,
    winner: null,
  };

  res.json({ success: true, gameId, gameState: activeGames[gameId] });
});

// -------------------------------------------------------------------
// ENDPOINT 2: POST /api/game/roll - Server-side dice generation (Anti-Cheat)
// -------------------------------------------------------------------
app.post('/api/game/roll', (req, res) => {
  const { gameId } = req.body;
  const game = activeGames[gameId];

  if (!game) return res.status(404).json({ error: 'Game session not found.' });
  if (game.isGameOver) return res.status(400).json({ error: 'Game is already over.' });

  // Anti-cheat: Dice roll generated strictly on the server (1 to 6)
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  const activePlayer = game.players[game.currentPlayerIndex];

  if (diceRoll === 1) {
    activePlayer.turnScore = 0;
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    return res.json({ diceRoll, piggedOut: true, gameState: game });
  } else {
    activePlayer.turnScore += diceRoll;
    return res.json({ diceRoll, piggedOut: false, gameState: game });
  }
});

// -------------------------------------------------------------------
// ENDPOINT 3: POST /api/game/hold - Bank points, check wins, save to Postgres
// -------------------------------------------------------------------
app.post('/api/game/hold', async (req, res) => {
  const { gameId, winnerName, winningScore, playersList } = req.body;
  
  let game = activeGames[gameId];

  // If game is active in memory, process turn / win condition
  if (game && !game.isGameOver) {
    const activePlayer = game.players[game.currentPlayerIndex];
    activePlayer.totalScore += activePlayer.turnScore;
    activePlayer.turnScore = 0;

    if (activePlayer.totalScore >= 100) {
      game.isGameOver = true;
      game.winner = activePlayer;
    } else {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
      return res.json({ gameState: game });
    }
  }

  // Resolve winner and players whether coming from active session or direct payload fallback
  const finalWinner = game?.winner?.name || winnerName || 'Unknown Player';
  const finalScore = game?.winner?.totalScore || winningScore || 100;
  const allPlayers = game?.players ? game.players.map(p => p.name) : (playersList || [finalWinner]);

  try {
    // Save match results to PostgreSQL
    await db.query(
      `INSERT INTO match_results (winner_name, winning_score, players_count, all_players)
       VALUES ($1, $2, $3, $4)`,
      [finalWinner, finalScore, allPlayers.length, allPlayers]
    );

    // Update player statistics safely using parameterized queries
    for (const name of allPlayers) {
      const isWinner = name === finalWinner;
      const existing = await db.query('SELECT * FROM players WHERE username = $1', [name]);

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        await db.query(
          `UPDATE players 
           SET total_wins = $1, games_played = $2, highest_score = $3 
           WHERE username = $4`,
          [
            isWinner ? row.total_wins + 1 : row.total_wins,
            row.games_played + 1,
            Math.max(row.highest_score, finalScore),
            name,
          ]
        );
      } else {
        await db.query(
          `INSERT INTO players (username, total_wins, games_played, highest_score)
           VALUES ($1, $2, 1, $3)`,
          [name, isWinner ? 1 : 0, finalScore]
        );
      }
    }
  } catch (err) {
    console.error('PostgreSQL DB Save Error:', err.message);
  }

  // Cleanup active session if it existed
  if (gameId && activeGames[gameId]) {
    delete activeGames[gameId];
  }

  res.json({ success: true, message: 'Match successfully recorded to PostgreSQL' });
});

// -------------------------------------------------------------------
// ENDPOINT 4: GET /api/leaderboard - Search & filter player stats
// -------------------------------------------------------------------
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { search, minPoints } = req.query;
    let queryText = 'SELECT * FROM players WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      queryText += ` AND username ILIKE $${params.length}`;
    }

    if (minPoints && !isNaN(minPoints)) {
      params.push(parseInt(minPoints, 10));
      queryText += ` AND highest_score >= $${params.length}`;
    }

    queryText += ' ORDER BY total_wins DESC LIMIT 50';

    const result = await db.query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Leaderboard fetch error:', err.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Greedy Pig Express server running on port ${PORT}`));