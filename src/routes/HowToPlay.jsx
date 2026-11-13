import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiFlag,
  FiPlay,
  FiRefreshCw,
  FiShield,
  FiTarget,
  FiUsers,
  FiAlertTriangle,
  FiAward,
} from "react-icons/fi";

import { PremiumLayout, Panel } from "../components/PremiumLayout";
import mascot from "../assets/pig-0.png";
import diceOne from "../assets/dice_1.png";
import diceSix from "../assets/dice_6.png";

const setupSteps = [
  {
    number: "01",
    title: "Set your target score",
    description:
      "Choose the total number of points players need to reach to win. For example, 100 points.",
    icon: FiTarget,
  },
  {
    number: "02",
    title: "Choose your players",
    description:
      "Enter the number of people who will be playing the game.",
    icon: FiUsers,
  },
  {
    number: "03",
    title: "Enter player names",
    description:
      "Give each player a name so everyone can track their scores.",
    icon: FiBookOpen,
  },
  {
    number: "04",
    title: "Start the game",
    description:
      "Click the Play button to begin your first round.",
    icon: FiPlay,
  },
];

const gameRules = [
  {
    number: "01",
    title: "Roll the die",
    description:
      "On your turn, keep rolling the die to collect points. You can roll as many times as you want until you decide to pass or roll a one.",
    icon: FiRefreshCw,
    accent: "violet",
  },
  {
    number: "02",
    title: "Avoid rolling a one",
    description:
      "If you roll a one, you lose all the points collected during that turn. Your turn ends and the next player takes over.",
    icon: FiAlertTriangle,
    accent: "pink",
  },
  {
    number: "03",
    title: "Build your turn score",
    description:
      "Every roll from two to six adds points to your current turn total. The more you roll, the more points you could earn.",
    icon: FiTarget,
    accent: "teal",
  },
  {
    number: "04",
    title: "Pass to protect your points",
    description:
      "Choose Pass to stop rolling and add your turn points to your overall score. This ends your turn.",
    icon: FiShield,
    accent: "violet",
  },
  {
    number: "05",
    title: "Reach the winning score",
    description:
      "The first player to reach the target score wins. For a standard game, the target is 100 points.",
    icon: FiAward,
    accent: "pink",
  },
];

const tones = {
  violet: {
    icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    number: "text-violet-300",
  },
  pink: {
    icon: "border-pink-400/20 bg-pink-400/10 text-pink-300",
    number: "text-pink-300",
  },
  teal: {
    icon: "border-teal-400/20 bg-teal-400/10 text-teal-300",
    number: "text-teal-300",
  },
};

export default function HowToPlay() {
  return (
    <PremiumLayout
      eyebrow="THE PLAYER'S GUIDE"
      title="How to Play"
      description="Everything you need to know before entering the arena. Learn the rules, understand the risks, and get ready to roll."
    >
      <section className="relative mb-10 overflow-hidden rounded-[28px] border border-pink-400/20 bg-[linear-gradient(115deg,#30203e_0%,#24172f_52%,#1b1730_100%)] px-6 py-9 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-pink-500/20 blur-[85px]" />

        <div className="relative z-10 max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#ff9bcd]">
            <FiBookOpen size={14} />
            Learn the game
          </div>

          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            Roll smart.
            <br />
            <span className="text-[#ff65b0]">
              Play bold.
            </span>
          </h2>

          <p className="mt-5 max-w-md text-sm leading-7 text-[#c5b9d0] sm:text-base">
            Greedy Pig is a game of risk and reward.
            Roll the die to earn points, but know when
            to stop. One unlucky roll can cost you
            everything you earned that turn.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/live-game/setup"
              className="inline-flex items-center gap-3 rounded-xl bg-[#f344a0] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_35px_rgba(243,68,160,0.3)] transition hover:bg-[#ff61b3]"
            >
              <FiPlay fill="currentColor" />
              Play Game
              <FiArrowRight />
            </Link>

            <Link
              to="/tutorial"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <FiBookOpen />
              Try Tutorial
            </Link>
          </div>
        </div>

        <img
          src={mascot}
          alt="Greedy Pig mascot"
          className="pointer-events-none relative z-0 mx-auto mt-6 h-48 w-48 object-contain drop-shadow-[0_20px_30px_rgba(255,76,160,0.2)] sm:absolute sm:bottom-4 sm:right-0 sm:mt-0 sm:h-56 sm:w-56 xl:right-6 xl:h-64 xl:w-64"
        />
      </section>

      <section className="mb-11">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff83c1]">
            Getting started
          </p>

          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Game Setup
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Follow these four steps to prepare your game.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {setupSteps.map((step) => {
            const Icon = step.icon;

            return (
              <Panel
                key={step.number}
                className="group transition duration-200 hover:-translate-y-1 hover:border-pink-400/25"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-400/10 text-pink-300">
                    <Icon size={23} />
                  </span>

                  <span className="text-2xl font-black text-white/15">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {step.description}
                </p>
              </Panel>
            );
          })}
        </div>
      </section>

      <section className="mb-11">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff83c1]">
            Know the rules
          </p>

          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Greedy Pig Rules
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Understand how to earn points, protect your score,
            and win the game.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {gameRules.map((rule) => {
            const Icon = rule.icon;
            const tone = tones[rule.accent];

            return (
              <Panel
                key={rule.number}
                className="group transition duration-200 hover:-translate-y-1 hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${tone.icon}`}
                  >
                    <Icon size={23} />
                  </span>

                  <span
                    className={`text-2xl font-black opacity-50 ${tone.number}`}
                  >
                    {rule.number}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  {rule.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {rule.description}
                </p>
              </Panel>
            );
          })}
        </div>
      </section>

      <section className="mb-11">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff83c1]">
            Risk versus reward
          </p>

          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Every Roll Matters
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Two possible rolls. Two very different outcomes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="border-pink-400/20">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-pink-400/10 px-3 py-1.5 text-xs font-bold text-pink-300">
                <FiAlertTriangle />
                Risk
              </span>

              <img
                src={diceOne}
                alt="Die showing one"
                className="h-16 w-16 object-contain"
              />
            </div>

            <h3 className="mt-5 text-xl font-extrabold">
              Roll a One
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Your turn ends immediately and you lose
              the points earned during that turn.
            </p>
          </Panel>

          <Panel className="border-teal-400/20">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-400/10 px-3 py-1.5 text-xs font-bold text-teal-300">
                <FiCheckCircle />
                Reward
              </span>

              <img
                src={diceSix}
                alt="Die showing six"
                className="h-16 w-16 object-contain"
              />
            </div>

            <h3 className="mt-5 text-xl font-extrabold">
              Roll Two to Six
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Add the rolled number to your turn total.
              Keep rolling or pass to protect your points.
            </p>
          </Panel>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[24px] border border-pink-400/20 bg-[linear-gradient(100deg,#251a37,#1c2333)] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-pink-500/10 blur-[65px]" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              <FiFlag />
              Ready for the challenge?
            </div>

            <h2 className="text-2xl font-extrabold">
              Think you can win?
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-7 text-[#bcb4cb]">
              You know the rules. Now it is time to
              put your strategy to the test.
            </p>
          </div>

          <Link
            to="/live-game/setup"
            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-[#f344a0] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#ff61b3]"
          >
            <FiPlay fill="currentColor" />
            Start Playing
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </PremiumLayout>
  );
}
