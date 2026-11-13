import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiUsers,
  FiTarget,
  FiPlay,
  FiRefreshCw,
  FiSettings,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiVolume2,
} from "react-icons/fi";

import { useLiveGameContext } from "src/context/useLiveGameContext";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";

import AddPlayerButton from "./components/AddPlayerButton";
import NameInput from "./components/NameInput";
import ImageSlider from "./components/ImageSlider";
import { soundManager } from "src/soundManager";

function LiveGameSetup() {
  const {
    playerData,
    maxPoints,
    setMaxPoints,
    gameLevel,
    setGameLevel,
    startNewGame,
    setPlayerData,
    setDiceValue,
    setIsGameOver,
    setCurrentPlayer,
    isContinue,
  } = useLiveGameContext();

  const navigate = useNavigate();

  const { preloadSrcList, pigPetNames } =
    useGreedyPigContext();

  const pigs = preloadSrcList.filter((pig) =>
    pig.includes("pig")
  );

  const [error, setError] = useState("");
  const [isAudioMuted, setIsAudioMuted] = useState(soundManager.isMuted);

  // Sync with global accessibility preferences on load
  useEffect(() => {
    try {
      const STORAGE_KEY = "greedy-pig-accessibility";
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved.soundEffects === "boolean") {
        soundManager.isMuted = !saved.soundEffects;
        setIsAudioMuted(!saved.soundEffects);
      }
    } catch (e) {
      console.warn("Could not read preferences", e);
    }
  }, []);

  function handleAudioToggle() {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
    
    // Update the global accessibility database so the menus match
    try {
      const STORAGE_KEY = "greedy-pig-accessibility";
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      saved.soundEffects = !muted;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.warn("Could not save preferences", e);
    }
  }

  const playerCount = playerData.length;
  const scoreValue = Number(maxPoints);
  const validScore = Number.isInteger(scoreValue) && scoreValue >= 25;

  const playerNames = playerData.map((player) =>
    String(player.name ?? "").trim()
  );
  const oneChancePercent = ((100 / 6) * 1.4 ** (gameLevel - 1)).toFixed(1);

  function validateSetup() {
    if (playerCount < 2) {
      setError("Add at least two players before starting a game.");
      return false;
    }

    if (!validScore) {
      setError("Enter a valid target score of at least 25.");
      return false;
    }

    setError("");
    return true;
  }

  async function setupPlayers(resume) {
    if (!resume) {
      if (!validateSetup()) return;

      const newPlayerData = playerData.map((player) => ({
        ...player,
        score: 0,
        runningScore: 0,
        running_points: 0,
        total_points: 0,
      }));

      await startNewGame({
        players: newPlayerData,
        targetScore: scoreValue,
        level: gameLevel,
      });
      setDiceValue(0);
      setIsGameOver(false);
      setCurrentPlayer(0);
      setPlayerData(newPlayerData);
    }

    navigate("/live-game/game");
  }

  function clearPlayers() {
    setPlayerData(getInitialPlayerData(pigs, pigPetNames));
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#110e1d] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-pink-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            to="/"
            className="text-xl font-black tracking-tight sm:text-2xl"
          >
            GREEDY
            <span className="text-pink-400">PIG</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tutorial"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-pink-400/30 hover:text-pink-300"
            >
              How to Play
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              <FiArrowLeft />
              Home
            </Link>
          </div>
        </header>

        <div className="mb-9">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-pink-300">
            <FiSettings />
            Arena Configuration
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Set Up Your{" "}
            <span className="text-pink-400">
              Game
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Assemble your players, choose your target
            score, and prepare for a competitive game
            of Greedy Pig.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-white/10 bg-[#211c30] p-5 shadow-xl sm:p-7">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <FiUsers
                      className="text-pink-300"
                      size={23}
                    />

                    <h2 className="text-xl font-black text-white">
                      Players
                    </h2>
                  </div>

                  <p className="text-sm leading-6 text-slate-400">
                    Enter player names and choose
                    an avatar for each competitor.
                  </p>
                </div>

                <span className="rounded-full border border-pink-400/20 bg-pink-400/10 px-4 py-2 text-xs font-bold text-pink-300">
                  {playerCount}{" "}
                  {playerCount === 1
                    ? "Player"
                    : "Players"}
                </span>
              </div>

              <div className="grid max-h-[650px] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
                {playerData.map((player, index) => (
                  <div
                    key={player.id}
                    className="min-w-0 rounded-2xl border border-white/10 bg-[#171222] p-4 transition hover:border-pink-400/30"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                        Player {index + 1}
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-400/10 text-xs font-black text-pink-300">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <NameInput
                        player={player}
                        index={index}
                      />

                      <ImageSlider
                        player={player}
                        index={index}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-pink-400/25 bg-pink-400/5 p-5 transition hover:border-pink-400/50">
                  <AddPlayerButton />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-xs text-slate-500">
                  Each player can choose their own
                  name and pig avatar.
                </p>

                <button
                  type="button"
                  onClick={clearPlayers}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-400/20"
                >
                  <FiRefreshCw />
                  Reset Players
                </button>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-[#211c30] p-5 shadow-xl sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <FiTarget
                  className="text-violet-300"
                  size={23}
                />

                <div>
                  <h2 className="text-xl font-black text-white">
                    Game Settings
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Configure your match before
                    entering the arena.
                  </p>
                </div>
              </div>

              <label
                htmlFor="max-score"
                className="mb-2 block text-sm font-bold text-white"
              >
                Target Score
              </label>

              <p className="mb-4 text-xs leading-5 text-slate-400">
                The first player to reach the
                target score wins the match.
              </p>

              <div className="flex flex-wrap gap-3">
                {[50, 100, 150, 200].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => {
                      setMaxPoints(score);
                      setError("");
                    }}
                    aria-pressed={
                      Number(maxPoints) === score
                    }
                    className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${
                      Number(maxPoints) === score
                        ? "border-pink-400 bg-pink-500/20 text-pink-200"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="mt-5 max-w-xs">
                <label
                  htmlFor="max-score"
                  className="mb-2 block text-xs font-semibold text-slate-400"
                >
                  Or enter a custom target
                </label>

                <input
                  id="max-score"
                  type="number"
                  min={25}
                  step={1}
                  value={maxPoints}
                  onChange={(event) => {
                    setMaxPoints(event.target.value);
                    setError("");
                  }}
                  aria-invalid={!validScore}
                  className="w-full rounded-xl border border-white/15 bg-[#171222] px-4 py-3 text-white outline-none transition focus:border-pink-400"
                  required
                />
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-sm font-bold text-white">
                  Dice Difficulty
                </h3>
                <p className="mb-4 text-xs leading-5 text-slate-400">
                  Each level increases the chance of rolling a 1.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setGameLevel(level)}
                      aria-pressed={gameLevel === level}
                      className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                        gameLevel === level
                          ? "border-pink-400 bg-pink-500/20 text-pink-200"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 border-t border-white/10 pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <FiVolume2
                    className="text-teal-300"
                    size={20}
                  />

                  <h3 className="font-bold text-white">
                    Sound Preferences
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleAudioToggle}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#171222] px-4 py-3 transition hover:border-pink-400/50"
                  aria-label="Toggle Sound"
                >
                  <span className="text-sm font-bold text-slate-300">
                    Game Audio
                  </span>
                  
                  <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${!isAudioMuted ? 'bg-pink-500' : 'bg-slate-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${!isAudioMuted ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[24px] border border-pink-400/20 bg-gradient-to-br from-[#392044] via-[#251a34] to-[#171222] p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <FiAward
                  className="text-pink-300"
                  size={24}
                />

                <h2 className="text-xl font-black text-white">
                  Match Overview
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm text-slate-400">
                    Game Mode
                  </span>

                  <span className="text-sm font-bold text-white">
                    Local Multiplayer
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm text-slate-400">
                    Players
                  </span>

                  <span className="text-sm font-bold text-white">
                    {playerCount}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm text-slate-400">
                    Target Score
                  </span>

                  <span className="text-sm font-bold text-pink-300">
                    {validScore ? scoreValue : "Not set"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm text-slate-400">Difficulty</span>
                  <span className="text-sm font-bold text-pink-300">
                    Level {gameLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Match Status
                  </span>

                  <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-300">
                    <FiCheckCircle />
                    Setup
                  </span>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Player Lineup
                </p>

                <div className="space-y-3">
                  {playerNames.map((name, index) => (
                    <div
                      key={playerData[index].id}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-400/15 text-xs font-black text-pink-300">
                        {index + 1}
                      </span>

                      <span className="min-w-0 truncate text-sm font-semibold text-white">
                        {name || `Player ${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-200"
                >
                  <FiAlertCircle
                    className="mt-1 shrink-0"
                  />
                  {error}
                </div>
              )}

              <div className="mt-7 space-y-3">
                {isContinue ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setupPlayers(false)}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-pink-500/15 transition hover:bg-pink-400"
                    >
                      <FiPlay size={19} />
                      Start New Game
                      <FiArrowRight />
                    </button>

                    <button
                      type="button"
                      onClick={() => setupPlayers(true)}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-pink-400/30 bg-pink-400/10 px-5 py-4 text-sm font-black text-pink-200 transition hover:bg-pink-400/20"
                    >
                      <FiRefreshCw size={18} />
                      Resume Game
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setupPlayers(false)}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-pink-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-pink-500/15 transition hover:bg-pink-400"
                  >
                    <FiPlay size={19} />
                    Start Game
                    <FiArrowRight />
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-[#211c30] p-6">
              <div className="mb-4 flex items-center gap-3">
                <FiInfo
                  className="text-violet-300"
                  size={22}
                />

                <h2 className="text-lg font-black text-white">
                  Before You Play
                </h2>
              </div>

              <p className="text-sm leading-7 text-slate-400">
                Greedy Pig is a push-your-luck dice game.
                Roll to build your score, but be careful
                not to lose your unbanked points.
              </p>

              <Link
                to="/tutorial"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-pink-300 transition hover:text-pink-200"
              >
                Learn the Rules
                <FiArrowRight />
              </Link>
            </section>
          </aside>
        </div>

        <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-slate-500">
          Greedy Pig · Roll smart. Play bold.
        </footer>
      </div>
    </div>
  );
}

export default LiveGameSetup;
