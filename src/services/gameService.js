import { supabase } from '../supabaseClient';

/**
 * Record a completed match and update player career stats
 * @param {string} winnerName - Username of the winning player
 * @param {number} winningScore - Final score achieved by the winner
 * @param {number} totalPlayers - Number of participants in the match
 */
export const recordMatchResult = async (winnerName, winningScore, totalPlayers) => {
  try {
    // 1. Insert historical match log
    const { error: matchError } = await supabase
      .from('match_results')
      .insert([
        {
          winner_name: winnerName,
          winning_score: winningScore,
          players_count: totalPlayers,
        },
      ]);

    if (matchError) throw matchError;

    // 2. Check if player already exists in the players table
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('username', winnerName)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingPlayer) {
      // 3a. Update existing player stats
      const { error: updateError } = await supabase
        .from('players')
        .update({
          total_wins: existingPlayer.total_wins + 1,
          games_played: existingPlayer.games_played + 1,
          highest_score: Math.max(existingPlayer.highest_score, winningScore),
        })
        .eq('id', existingPlayer.id);

      if (updateError) throw updateError;
    } else {
      // 3b. Insert new player profile
      const { error: insertError } = await supabase
        .from('players')
        .insert([
          {
            username: winnerName,
            total_wins: 1,
            highest_score: winningScore,
            games_played: 1,
          },
        ]);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording match result:', error.message);
    return { success: false, error: error.message };
  }
};