import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LiveGameContext } from "../../../context/useLiveGameContext";
import PlayerTable from "./components/PlayerTable";
import DiceSection from "./components/DiceSection";
import StatsSection from "./components/StatsSection";
import GameOver from "./GameOver";

export default function Game() {
  const { isGameOver, playerData, currentPlayer, maxPoints } = useContext(LiveGameContext);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen p-6 md:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Conditionally display the Game Over / Victory Modal */}
      {isGameOver && <GameOver />}

      {/* Arena Header with Target Score and End Game Button */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#ffffff10] p-6 rounded-3xl border border-white/10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Game Arena</h1>
          <p className="text-white/60">Roll strategically, protect your points, and compete for victory.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-6 py-3 rounded-2xl text-center border border-white/10">
            <span className="text-xs uppercase tracking-wider text-white/60 block">Target Score</span>
            <span className="text-2xl font-black text-pink-400">{maxPoints}</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-2xl text-sm transition border border-white/10 cursor-pointer"
          >
            End Game
          </button>
        </div>
      </div>

      {/* Main Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="bg-[#ffffff08] p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
          <DiceSection />
        </div>
        
        <div className="lg:col-span-2 bg-[#ffffff08] p-6 rounded-3xl border border-white/10">
          <PlayerTable playerData={playerData} currentPlayer={currentPlayer} />
        </div>
      </div>

      <StatsSection />
    </div>
  );
}