import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiAward,
  FiTarget,
  FiUsers,
  FiInfo,
  FiSettings,
} from "react-icons/fi";

import { useLiveGameContext } from "src/context/useLiveGameContext";

import PlayerTable from "./components/PlayerTable";
import StatsSection from "./components/StatsSection";
import GameOver from "./GameOver";
import DiceSection from "./components/DiceSection";
import StatsSectionMobile from "./components/StatsSectionMobile";
import CurrentPlayerMobile from "./components/CurrentPlayerMobile";
import DiceSectionMobile from "./components/DiceSectionMobile";

export default function LiveGame() {
  const {
    playerData,
    currentPlayer,
    isGameOver,
    setIsContinue,
    maxPoints,
  } = useLiveGameContext();

  useEffect(() => {
    setIsContinue(true);
  }, [setIsContinue]);

  const activePlayer = playerData?.[currentPlayer];

  const activePlayerName =
    activePlayer?.name ||
    `Player ${currentPlayer + 1}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#110e1d] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-purple-700/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-pink-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link
            to="/"
            className="text-xl font-black tracking-tight sm:text-2xl"
          >
            GREEDY
            <span className="text-pink-400">PIG</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-400/10 px-4 py-2 text-xs font-bold text-pink-300">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              Live Match
            </span>

            <Link
              to="/live-game/setup"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-pink-400/30 hover:text-pink-300"
            >
              <FiSettings />
              Game Setup
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10"
            >
              <FiArrowLeft />
              Home
            </Link>
          </div>
        </header>

        <section className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
            <FiAward />
            Greedy Pig Arena
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Game{" "}
            <span className="text-pink-400">
              Arena
            </span>
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Roll strategically, protect your points,
            and compete for victory.
          </p>
        </section>

        <section
          aria-label="Match information"
          className="mb-6 grid gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/10 bg-[#211c30] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FiUsers className="text-pink-300" />
              Players
            </div>

            <p className="mt-3 text-2xl font-black text-white">
              {playerData?.length || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#211c30] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FiTarget className="text-violet-300" />
              Target Score
            </div>

            <p className="mt-3 text-2xl font-black text-white">
              {maxPoints}
            </p>
          </div>

          <div className="rounded-2xl border border-pink-400/20 bg-gradient-to-r from-[#382043] to-[#211c30] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-300">
              <FiAward />
              Current Turn
            </div>

            <p className="mt-3 truncate text-xl font-black text-white">
              {activePlayerName}
            </p>
          </div>
        </section>

        <div className="hidden min-h-[620px] gap-5 md:grid md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,220px)] lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,260px)] xl:grid-cols-[minmax(0,290px)_minmax(0,1fr)_minmax(0,290px)]">
          <section
            aria-label="Dice controls"
            className="min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#211c30] shadow-xl"
          >
            <DiceSection />
          </section>

          <section
            aria-label="Player scoreboard"
            className="min-w-0 overflow-hidden rounded-[24px] border border-pink-400/15 bg-[#211c30] p-3 shadow-xl lg:p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">
                  Player Scoreboard
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Track scores and player turns.
                </p>
              </div>

              <FiAward
                className="text-pink-300"
                size={22}
              />
            </div>

            <PlayerTable
              playerData={playerData}
              currentPlayer={currentPlayer}
            />
          </section>

          <section
            aria-label="Match statistics"
            className="min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#211c30] shadow-xl"
          >
            <StatsSection
              playerData={playerData}
              currentPlayer={currentPlayer}
            />
          </section>
        </div>

        <div className="space-y-5 md:hidden">
          <section
            aria-label="Current player"
            className="min-w-0 overflow-hidden rounded-[24px] border border-pink-400/20 bg-gradient-to-br from-[#392044] to-[#211c30] p-3"
          >
            <CurrentPlayerMobile
              playerData={playerData}
              currentPlayer={currentPlayer}
            />
          </section>

          <section
            aria-label="Mobile dice controls"
            className="min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#211c30] p-3"
          >
            <DiceSectionMobile />
          </section>

          <section
            aria-label="Mobile match statistics"
            className="min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#211c30] p-3"
          >
            <StatsSectionMobile
              playerData={playerData}
              currentPlayer={currentPlayer}
            />
          </section>
        </div>

        <section className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <FiInfo
            className="mt-0.5 shrink-0 text-pink-300"
            size={20}
          />

          <p className="text-sm leading-6 text-slate-400">
            <span className="font-bold text-white">
              Arena Tip:
            </span>{" "}
            Decide carefully when to roll again and
            when to hold your points. A risky roll
            could cost you your turn score.
          </p>
        </section>

        <footer className="mt-10 border-t border-white/10 py-6 text-center text-xs text-slate-500">
          Greedy Pig · Roll smart. Play bold.
        </footer>
      </div>

      {isGameOver && (
        <GameOver
          playerData={playerData}
          currentPlayer={currentPlayer}
          setIsContinue={setIsContinue}
        />
      )}
    </div>
  );
}
