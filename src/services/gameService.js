import { supabase } from '../supabaseClient';

export async function recordMatchResult(winnerName, winningScore, playersList) {
  try {
    const playerNames = playersList.map((p) => 
      p.name && p.name.trim() !== '' ? p.name : p.tag || 'Player'
    );

    // 1. Record match result (passing exact integer for players_count and array for all_players)
    const { error: matchError } = await supabase
      .from('match_results')
      .insert([
        {
          winner_name: winnerName,
          winning_score: winningScore,
          players_count: playersList.length, // Integer count
          all_players: playerNames,           // Array of strings
        },
      ]);

    if (matchError) {
      console.error('Match insert error:', matchError);
      throw matchError;
    }

    // 2. Update players table stats for all participants
    for (const player of playersList) {
      const username = player.name && player.name.trim() !== '' ? player.name : player.tag || 'Player';
      const isWinner = username === winnerName;
      const score = (player.total_points || 0) + (player.running_points || 0);

      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (existingPlayer) {
        await supabase
          .from('players')
          .update({
            total_wins: isWinner ? (existingPlayer.total_wins || 0) + 1 : (existingPlayer.total_wins || 0),
            games_played: (existingPlayer.games_played || 0) + 1,
            highest_score: Math.max(existingPlayer.highest_score || 0, score),
          })
          .eq('username', username);
      } else {
        await supabase
          .from('players')
          .insert([
            {
              username,
              total_wins: isWinner ? 1 : 0,
              games_played: 1,
              highest_score: score,
            },
          ]);
      }
    }
  } catch (err) {
    console.error('Error saving match result:', err.message || err);
  }
}