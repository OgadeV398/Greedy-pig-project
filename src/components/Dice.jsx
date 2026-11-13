import { useContext, useState, useEffect } from "react";
import { LiveGameContext } from "../context/useLiveGameContext";

// Import your actual dice face assets from assets folder
import dice1 from "../assets/dice_1.png";
import dice2 from "../assets/dice_2.png";
import dice3 from "../assets/dice_3.png";
import dice4 from "../assets/dice_4.png";
import dice5 from "../assets/dice_5.png";
import dice6 from "../assets/dice_6.png";

const diceImages = {
  1: dice1,
  2: dice2,
  3: dice3,
  4: dice4,
  5: dice5,
  6: dice6,
};

export function Dice() {
  const context = useContext(LiveGameContext) || {};
  const { setChangeBackground, handleRollDice, diceValue } = context;

  const [displayValue, setDisplayValue] = useState(diceValue || 1);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (diceValue && !isRolling) {
      setDisplayValue(diceValue);
    }
  }, [diceValue, isRolling]);

  const handleDiceClick = async () => {
    if (isRolling) return;

    if (typeof setChangeBackground === "function") {
      setChangeBackground((prev) => !prev);
    }

    setIsRolling(true);

    // Rapidly cycle through random dice faces for animation effect (600ms)
    let counter = 0;
    const interval = setInterval(async () => {
      const randomFace = Math.floor(Math.random() * 6) + 1;
      setDisplayValue(randomFace);
      counter++;
      
      if (counter > 10) {
        clearInterval(interval);
        setIsRolling(false);
        
        // Trigger the roll handler in LivePage which updates scores
        if (typeof handleRollDice === "function") {
          await handleRollDice();
        }
      }
    }, 50);
  };

  const currentImage = diceImages[displayValue] || dice1;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Visual Dice Box with your actual asset images */}
      <div 
        onClick={handleDiceClick}
        className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-pink-500/20 to-violet-600/20 flex items-center justify-center cursor-pointer transform transition hover:scale-105 active:scale-95 ${isRolling ? "animate-pulse" : ""}`}
      >
        <img 
          src={currentImage} 
          alt={`Dice ${displayValue}`} 
          className="w-24 h-24 object-contain drop-shadow-xl rounded-2xl"
        />
      </div>

      <button
        type="button"
        onClick={handleDiceClick}
        disabled={isRolling}
        className="cursor-pointer rounded-2xl bg-pink-500 px-6 py-3 text-white font-black transition hover:bg-pink-400 shadow-lg disabled:opacity-50"
      >
        {isRolling ? "Rolling..." : "Roll Dice"}
      </button>
    </div>
  );
}

export default Dice;