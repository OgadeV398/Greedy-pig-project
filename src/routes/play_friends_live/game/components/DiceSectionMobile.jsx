import React, { useState } from 'react';
import { useLiveGameContext } from 'src/context/useLiveGameContext';
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
const addPlayerSound = "/sound_effect/add_player.mp3";
const loseSound = "/sound_effect/lose_sound.mp3";
const celebrationSound = "/sound_effect/celebration.mp3";
import useAudio from "src/hooks/useAudio";

function DiceSectionMobile() {
  const {
    playerData,
    currentPlayer,
    maxPoints,
    handleRollDice,
    handleHoldDice,
  } = useLiveGameContext();
  
  const [isRolling, setIsRolling] = useState(false);
  const addPlayerAudio = useAudio(addPlayerSound);

  const handlePassClick = async (e) => {
    e.preventDefault();
    if (isRolling) return;
    addPlayerAudio?.play();
    
    // Call Express backend endpoint for holding points
    await handleHoldDice();
  };

  const handleFinalDiceValue = async () => {
    setIsRolling(true);
    try {
      // Call Express backend endpoint for secure roll
      await handleRollDice();
    } catch (err) {
      console.error("Error executing mobile server roll:", err);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="border-r-[#ffffff40] border-r md:hidden flex flex-col items-center justify-around px-2 bg-[#00000010] h-[60vh]">
      <button
        type="button"
        onClick={handlePassClick}
        className="bg-[#056FA480] w-[200px] md:w-full text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded border hover:scale-105 active:scale-100 duration-300 cursor-pointer"
      >
        PASS
      </button>

      <Dice
        getFinalDiceValue={handleFinalDiceValue}
        setIsRolling={setIsRolling}
        isRolling={isRolling}
        setChangeBackground={() => {}}
      />
      
      <Menu />
      
      <div className="text-white flex justify-between w-full">
        <p className="text-center text-sm lg:text-lg">{playerData?.length || 0} players</p>
        <p className="text-center text-sm lg:text-lg">{maxPoints} max points</p>
      </div>
    </div>
  );
}

export default DiceSectionMobile;