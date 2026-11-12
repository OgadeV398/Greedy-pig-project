import { useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiPlay,
  FiRefreshCw,
  FiTarget,
  FiAward,
} from "react-icons/fi";

import {
  PremiumLayout,
  Panel,
} from "../components/PremiumLayout";

const lessons = [
  {
    title: "Welcome to Greedy Pig",
    description:
      "Greedy Pig is a push-your-luck dice game. Roll to collect points, but know when to stop!",
    tip: "The goal is to finish with the highest total score.",
  },
  {
    title: "Roll the Die",
    description:
      "Each roll can add points to your current turn. Higher rolls help you build your score faster.",
    tip: "You can keep rolling to collect more points.",
  },
  {
    title: "Watch Out for One",
    description:
      "Rolling a 1 ends your turn and causes you to lose the points you collected during that turn.",
    tip: "Your previously banked points remain safe.",
  },
  {
    title: "Hold Your Points",
    description:
      "Holding saves your current turn points to your total score and ends your turn.",
    tip: "Sometimes protecting your points is better than risking another roll.",
  },
  {
    title: "Ready to Play?",
    description:
      "You've learned the basics! Try the practice round below, then challenge your friends.",
    tip: "A good player knows when to roll and when to hold.",
  },
];

const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function InteractiveTutorial() {
  const [step, setStep] = useState(0);
  const [die, setDie] = useState(null);
  const [turnScore, setTurnScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [message, setMessage] = useState(
    "Roll the die to begin your practice round."
  );
  const [completed, setCompleted] = useState(false);

  const lesson = lessons[step];
  const progress = ((step + 1) / lessons.length) * 100;

  function rollDie() {
    const result = Math.floor(Math.random() * 6) + 1;

    setDie(result);

    if (result === 1) {
      setTurnScore(0);
      setMessage(
        "Oh no! You rolled a 1. Your turn points are lost. Try again!"
      );
    } else {
      setTurnScore((previous) => previous + result);
      setMessage(
        `You rolled ${result}! Keep rolling or hold your points.`
      );
    }
  }

  function holdPoints() {
    if (turnScore === 0) {
      setMessage("Roll first to collect some points.");
      return;
    }

    setTotalScore((previous) => previous + turnScore);
    setMessage(
      `Great decision! You banked ${turnScore} points.`
    );
    setTurnScore(0);
    setDie(null);
  }

  function resetPractice() {
    setDie(null);
    setTurnScore(0);
    setTotalScore(0);
    setMessage("Practice reset. Roll to start again!");
  }

  function nextStep() {
    if (step < lessons.length - 1) {
      setStep((previous) => previous + 1);
    } else {
      setCompleted(true);

      try {
        localStorage.setItem(
          "greedy-pig-tutorial-complete",
          "true"
        );
      } catch (error) {
        console.warn(
          "Could not save tutorial completion:",
          error
        );
      }
    }
  }

  function previousStep() {
    if (step > 0) {
      setStep((previous) => previous - 1);
    }
  }

  function restartTutorial() {
    setStep(0);
    setCompleted(false);
    resetPractice();

    try {
      localStorage.removeItem(
        "greedy-pig-tutorial-complete"
      );
    } catch (error) {
      console.warn(
        "Could not clear tutorial completion:",
        error
      );
    }
  }

  return (
    <PremiumLayout
      eyebrow="Learn to Play"
      title="Interactive Tutorial"
      description="Master the basics of Greedy Pig with guided lessons and a hands-on practice round."
    >
      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-pink-300">
              Tutorial Progress
            </p>

            <h2 className="mt-2 text-xl font-black text-white">
              {completed
                ? "Tutorial Complete!"
                : `Lesson ${step + 1} of ${lessons.length}`}
            </h2>
          </div>

          <span className="text-2xl font-black text-pink-300">
            {completed ? 100 : Math.round(progress)}%
          </span>
        </div>

        <div
          className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={completed ? 100 : progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tutorial progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-400 transition-all duration-300"
            style={{
              width: `${completed ? 100 : progress}%`,
            }}
          />
        </div>
      </Panel>

      {completed ? (
        <Panel>
          <div className="py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-400/15 text-pink-300">
              <FiAward size={42} />
            </div>

            <h2 className="mt-6 text-3xl font-black text-white">
              Congratulations!
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-300">
              You&apos;ve completed the Greedy Pig tutorial.
              You now know how to roll, hold and protect
              your points.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="/live-game/setup"
                className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 font-bold text-white transition hover:bg-pink-400"
              >
                <FiPlay />
                Play Greedy Pig
              </a>

              <button
                type="button"
                onClick={restartTutorial}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                <FiRefreshCw />
                Restart Tutorial
              </button>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-400/10 text-pink-300">
              <FiBookOpen size={28} />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-pink-300">
              Lesson {step + 1}
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              {lesson.title}
            </h2>

            <p className="mt-5 text-sm leading-8 text-slate-300">
              {lesson.description}
            </p>

            <div className="mt-7 rounded-2xl border border-violet-400/20 bg-violet-400/10 p-5">
              <div className="flex items-start gap-3">
                <FiTarget
                  className="mt-1 shrink-0 text-violet-300"
                  size={20}
                />

                <div>
                  <p className="font-bold text-white">
                    Pro Tip
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {lesson.tip}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiArrowLeft />
                Previous
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-400"
              >
                {step === lessons.length - 1
                  ? "Finish Tutorial"
                  : "Next Lesson"}

                {step === lessons.length - 1 ? (
                  <FiCheckCircle />
                ) : (
                  <FiArrowRight />
                )}
              </button>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Practice Arena
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Try Your Luck
                </h2>
              </div>

              <FiTarget
                className="text-violet-300"
                size={25}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Turn Score
                </p>

                <p className="mt-3 text-3xl font-black text-pink-300">
                  {turnScore}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Banked Score
                </p>

                <p className="mt-3 text-3xl font-black text-teal-300">
                  {totalScore}
                </p>
              </div>
            </div>

            <div className="mt-8 flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#171222]">
              <div
                className="text-8xl leading-none text-pink-300"
                role="img"
                aria-label={
                  die
                    ? `Die showing ${die}`
                    : "Die not rolled"
                }
              >
                {die ? diceFaces[die - 1] : "⚄"}
              </div>

              <p className="mt-4 text-xs text-slate-400">
                {die
                  ? `Last roll: ${die}`
                  : "Ready to roll?"}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={rollDie}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-4 py-3 font-bold text-white transition hover:bg-pink-400"
              >
                <FiPlay />
                Roll Dice
              </button>

              <button
                type="button"
                onClick={holdPoints}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/15 px-4 py-3 font-bold text-violet-200 transition hover:bg-violet-400/25"
              >
                <FiCheckCircle />
                Hold
              </button>
            </div>

            <button
              type="button"
              onClick={resetPractice}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10"
            >
              <FiRefreshCw />
              Reset Practice
            </button>

            <p
              role="status"
              aria-live="polite"
              className="mt-5 min-h-[48px] rounded-xl bg-white/5 p-4 text-center text-sm leading-6 text-slate-300"
            >
              {message}
            </p>
          </Panel>
        </div>
      )}
    </PremiumLayout>
  );
}
