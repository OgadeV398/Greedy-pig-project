import { useContext } from "react";
import { LiveGameContext } from "../../../../context/useLiveGameContext";

export default function CurrentPlayerMobile() {
  const { playerData = [], currentPlayer = 0 } = useContext(LiveGameContext);
  const activePlayer = playerData[currentPlayer] || playerData[0] || { name: "Player", score: 0 };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-pink-300">Current Turn</p>
        <h3 className="mt-1 text-lg font-black">{activePlayer.name || activePlayer.username || "Player"}</h3>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">Score</p>
        <p className="text-xl font-black text-pink-300">{activePlayer.score ?? activePlayer.totalScore ?? 0}</p>
      </div>
    </div>
  );
}