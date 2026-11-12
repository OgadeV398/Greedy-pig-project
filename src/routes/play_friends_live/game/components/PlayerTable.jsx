import React from 'react'

function PlayerTable({ playerData, currentPlayer }) {
  return (
    <table className="hidden md:table w-full">
      <thead>
        <tr className="w-full h-[50px] bg-[#ffffff20] text-sm lg:text-base items-center p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300">
          <th className="text-center text-white">Icons</th>
          <th className="text-center text-white">Name</th>
          <th className="text-center text-white">Total Points</th>
          <th className="text-center text-white">Running Points</th>
        </tr>
      </thead>
   
      <tbody>
        {playerData?.map((player, index) => {
          const totalScore = Number(player.score ?? player.total_points ?? 0);
          const runningScore = Number(player.runningScore ?? player.running_points ?? 0);

          return (
            <tr
              key={player.id || index}
              id={index}
              className={`${
                index === currentPlayer % playerData.length
                  ? "bg-[#ffffff40]"
                  : ""
              } w-full text-base lg:text-xl p-2 rounded-lg bg-[#ffffff10] border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300 scroll-mt-[300px] text-center text-white`}
            >
              <td className="h-[70px] p-2 grid place-content-center">
                <figure className="w-[50px] bg-[#ffffff20] p-2 border border-[#FFFF8F40] rounded">
                  <img src={player.avatar} alt={player.name || "avatar"} />
                </figure>
              </td>
              <td className="">
                {player.name === '' ? player.tag : player.name}
              </td>
              {/* Total Points (Banked Score) */}
              <td className="font-bold text-pink-400">
                {totalScore}
              </td>
              {/* Running Points (Current Turn Score) */}
              <td className="font-bold text-violet-400">
                {runningScore}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )
}

export default PlayerTable