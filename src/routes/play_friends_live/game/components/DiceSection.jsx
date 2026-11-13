import { useContext } from "react";
import { LiveGameContext } from "../../../../context/useLiveGameContext";
import Dice from "../../../../components/Dice";

export default function DiceSection() {
  const { handleHoldDice } = useContext(LiveGameContext);

  const handlePassClick = () => {
    if (typeof handleHoldDice === "function") {
      handleHoldDice();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <Dice />

      <button
        type="button"
        onClick={handlePassClick}
        className="cursor-pointer rounded-2xl bg-[#056FA4] px-8 py-4 text-white font-black tracking-wider transition hover:bg-[#045a85] shadow-lg active:scale-95"
      >
        PASS
      </button>
    </div>
  );
}