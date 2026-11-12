import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LiveGameContext } from "../../../context/useLiveGameContext";
import { saveLocalWin } from "../../../services/gameService";

export default function GameOver() {
  const context = useContext(LiveGameContext) || {};
  const { playerData = [], maxPoints = 100, setPlayerData, setIsGameOver, setCurrentPlayer } = context;
  const navigate = useNavigate();

  if (!playerData || playerData.length === 0) {
    return null;
  }

  // Find the winning player with strict name sanitization
  const rawWinner = playerData.reduce((max, p) => ((p.score || 0) > (max?.score || 0) ? p : max), playerData[0]);
  
  const winnerName = (rawWinner?.name || rawWinner?.username || "").trim();
  const finalWinnerName = winnerName && winnerName.toLowerCase() !== "unknown player" ? winnerName : "Player 1";
  
  const winner = {
    ...rawWinner,
    name: finalWinnerName,
    score: rawWinner?.score || maxPoints
  };

  useEffect(() => {
    if (winner && winner.name) {
      saveLocalWin(winner.name, winner.score, winner.avatar || "");
    }
  }, [winner.name, winner.score]);

  const handlePlayAgain = () => {
    setPlayerData((prev) => (prev || []).map(p => ({ ...p, score: 0, runningScore: 0 })));
    setCurrentPlayer(0);
    setIsGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#1a1a1a] border border-pink-500/40 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6">
        
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full blur-lg opacity-70 animate-pulse"></div>
          <div className="relative w-24 h-24 rounded-2xl bg-white/10 border-2 border-pink-500 overflow-hidden flex items-center justify-center p-2">
            <img src={winner?.avatar || ""} alt={winner.name} className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>

        <div>
          <span className="text-pink-400 font-bold uppercase tracking-widest text-xs">Victory! Target {maxPoints} Reached</span>
          <h2 className="text-3xl font-black text-white mt-1">{winner.name} Wins! 🎉</h2>
          <p className="text-white/60 text-sm mt-2">Finished with an impressive score of <strong className="text-white">{winner.score}</strong> points.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            type="button"
            onClick={handlePlayAgain}
            className="flex-1 bg-pink-500 hover:bg-pink-400 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition transform active:scale-95 cursor-pointer"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-2xl border border-white/10 transition transform active:scale-95 cursor-pointer"
          >
            Main Menu
          </button>
        </div>

      </div>
    </div>
  );
}