import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FiRefreshCw } from "react-icons/fi";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import useAudio from "src/hooks/useAudio";

export function Dice({
  getFinalDiceValue,
  setIsRolling,
  isRolling,
  setChangeBackground,
}) {
  const { preloadSrcList } = useGreedyPigContext();
  const [currentDice, setCurrentDice] = useState(0);
  const diceRollAudio = useAudio(diceRollSound);

  const rollCallbackRef = useRef(getFinalDiceValue);
  const soundRef = useRef(diceRollAudio);
  const backgroundRef = useRef(setChangeBackground);
  const rollingRef = useRef(setIsRolling);

  useEffect(() => {
    rollCallbackRef.current = getFinalDiceValue;
    soundRef.current = diceRollAudio;
    backgroundRef.current = setChangeBackground;
    rollingRef.current = setIsRolling;
  });

  const diceImages = preloadSrcList.filter((image) =>
    image.includes("dice")
  );

  function handleDiceClick() {
    if (isRolling) return;

    setChangeBackground(true);
    setIsRolling(true);
  }

  useEffect(() => {
    if (!isRolling) return;

    let rollCount = 0;
    let finalValue = 1;

    const sound = soundRef.current;

    try {
      const playback = sound?.play();

      if (playback?.catch) {
        playback.catch(() => {});
      }
    } catch {
      console.warn("Dice audio could not be played.");
    }

    const interval = window.setInterval(() => {
      finalValue = Math.floor(Math.random() * 6) + 1;
      setCurrentDice(finalValue - 1);

      rollCount += 1;

      if (rollCount >= 30) {
        window.clearInterval(interval);

        rollCallbackRef.current(finalValue);
        rollingRef.current(false);
        backgroundRef.current(false);
      }
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRolling]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute h-44 w-44 rounded-full bg-pink-500/20 blur-3xl ${
            isRolling ? "animate-pulse" : ""
          }`}
        />

        <button
          type="button"
          onClick={handleDiceClick}
          disabled={isRolling}
          aria-label={isRolling ? "Dice rolling" : "Roll the dice"}
          aria-busy={isRolling}
          className={`relative flex h-44 w-44 items-center justify-center rounded-[28px] border border-pink-400/25 bg-gradient-to-br from-[#3a254c] to-[#1b1429] p-5 shadow-xl shadow-pink-500/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-400 sm:h-48 sm:w-48 ${
            isRolling
              ? "cursor-wait border-pink-400/50"
              : "cursor-pointer hover:scale-105 hover:border-pink-400/60 active:scale-95"
          }`}
        >
          {diceImages.map((dice, index) => (
            <img
              key={dice}
              src={dice}
              alt=""
              aria-hidden="true"
              draggable="false"
              className={`h-full w-full object-contain ${
                currentDice === index ? "block" : "hidden"
              }`}
            />
          ))}

          {diceImages.length === 0 && (
            <span className="text-6xl font-black text-white">
              {currentDice + 1}
            </span>
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          {isRolling ? "Rolling..." : "Ready to Roll"}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {isRolling
            ? "The dice is deciding your fate."
            : "Click the dice to roll."}
        </p>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-400/10 px-4 py-2 text-xs font-bold text-pink-300"
      >
        <FiRefreshCw
          className={isRolling ? "animate-spin" : ""}
        />

        {isRolling ? "Rolling Dice" : "Roll Available"}
      </div>
    </div>
  );
}

Dice.propTypes = {
  getFinalDiceValue: PropTypes.func.isRequired,
  setIsRolling: PropTypes.func.isRequired,
  isRolling: PropTypes.bool.isRequired,
  setChangeBackground: PropTypes.func.isRequired,
};
