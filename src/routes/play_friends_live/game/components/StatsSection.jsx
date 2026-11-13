import { useContext } from "react";
import { LiveGameContext } from "../../../../context/useLiveGameContext";

export default function StatsSection() {
  const { playerData = [] } = useContext(LiveGameContext);

  return (
    <div className="w-full">
      <table className="w-full text-left text-sm text-white">
        <thead>
          <tr className="border-b border-white/10 text-slate-400">
            <th className="pb-3 font-semibold">Icons</th>
            <th className="pb-3 font-semibold">Name</th>
            <th className="pb-3 font-semibold text-right">Total Points</th>
            <th className="pb-3 font-semibold text-right">Running Points</th>
          </tr>
        </thead>
        <tbody>
          {playerData.map((player, index) => (
            <tr key={player.id || index} className="border-b border-white/5">
              <td className="py-3">
                {player.avatar ? (
                  <img src={player.avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                )}
              </td>
              <td className="py-3 font-bold">{player.name || player.username || `Player ${index + 1}`}</td>
              <td className="py-3 text-right font-black text-pink-300">
                {player.score ?? player.totalScore ?? 0}
              </td>
              <td className="py-3 text-right font-bold text-slate-300">
                {player.runningScore ?? player.currentScore ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}