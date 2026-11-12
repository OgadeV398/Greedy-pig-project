import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiChevronRight,
  FiClock,
  FiHome,
  FiMenu,
  FiPlay,
  FiShield,
  FiTarget,
  FiUser,
  FiX,
} from "react-icons/fi";

import mascot from "../assets/pig-0.png";
import diceOne from "../assets/dice_1.png";
import diceSix from "../assets/dice_6.png";

const navigation = [
  { label: "Home", icon: FiHome, to: "/" },
  { label: "Profile", icon: FiUser, to: "/profile" },
  { label: "Leaderboard", icon: FiBarChart2, to: "/leaderboard" },
  {
    label: "How to Play",
    icon: FiBookOpen,
    to: "/live-game/how-to-play",
  },
  {
    label: "Interactive Tutorial",
    icon: FiBookOpen,
    to: "/tutorial",
  },
  { label: "Play Game", icon: FiPlay, to: "/live-game/setup" },
];

const features = [
  {
    title: "Match History",
    subtitle: "Review your past matches",
    icon: FiClock,
    accent: "violet",
    to: "/match-history",
  },
  {
    title: "Achievements",
    subtitle: "Unlock badges and rewards",
    icon: FiAward,
    accent: "pink",
    to: "/achievements",
  },
  {
    title: "Player Stats",
    subtitle: "Track your game performance",
    icon: FiTarget,
    accent: "teal",
    to: "/statistics",
  },
  {
    title: "Accessibility",
    subtitle: "Personalise your experience",
    icon: FiShield,
    accent: "violet",
    to: "/accessibility",
  },
];

function Brand() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3"
      aria-label="Greedy Pig home"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-400/25 bg-pink-500/10">
        <img
          src={mascot}
          alt=""
          className="h-10 w-10 object-contain"
        />
      </span>

      <span className="text-xl font-black tracking-tight text-white">
        GREEDY
        <span className="text-[#ff5eaf]">PIG</span>
      </span>
    </Link>
  );
}

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <Brand />

      <p className="mb-4 mt-12 px-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#817c99]">
        Navigation
      </p>

      <nav className="space-y-2" aria-label="Main navigation">
        {navigation.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400 ${
                isActive
                  ? "border-pink-400/20 bg-pink-500/15 text-[#ff82c0]"
                  : "border-transparent text-[#aaa5be] hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={19} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="rounded-2xl border border-pink-400/15 bg-pink-400/5 p-4">
          <p className="text-sm font-bold text-white">
            Ready to roll?
          </p>

          <p className="mt-2 text-xs leading-5 text-[#a9a3bd]">
            Challenge your friends and climb the leaderboard.
          </p>

          <Link
            to="/live-game/setup"
            onClick={onNavigate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f344a0] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#ff61b3]"
          >
            <FiPlay />
            Play Now
          </Link>
        </div>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  onNavigate: PropTypes.func,
};

function FeatureCard({ title, subtitle, icon: Icon, accent, to }) {
  const tones = {
    violet:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
    pink:
      "border-pink-400/20 bg-pink-400/10 text-pink-300",
    teal:
      "border-teal-400/20 bg-teal-400/10 text-teal-300",
  };

  return (
    <Link
      to={to}
      className="group block rounded-[22px] border border-white/[0.09] bg-[#211c30]/90 p-5 transition duration-200 hover:-translate-y-1 hover:border-pink-400/30 hover:bg-[#2b223c] hover:shadow-[0_12px_35px_rgba(243,68,160,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${tones[accent]}`}
        >
          <Icon size={23} />
        </span>

        <FiArrowRight
          size={19}
          className="text-[#817c99] transition group-hover:translate-x-1 group-hover:text-[#ff83c1]"
        />
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-[#aaa5be]">
        {subtitle}
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#ff83c1]">
        Explore
        <FiChevronRight className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  accent: PropTypes.oneOf(["violet", "pink", "teal"]).isRequired,
  to: PropTypes.string.isRequired,
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#110e1d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_5%,rgba(117,50,130,0.23),transparent_38%),radial-gradient(ellipse_at_10%_90%,rgba(19,100,119,0.16),transparent_40%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="sticky top-0 hidden h-screen w-[258px] shrink-0 overflow-y-auto border-r border-white/[0.08] bg-[#151120]/90 px-5 py-8 lg:block">
          <Sidebar />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            />

            <aside className="relative h-full w-[min(85vw,290px)] overflow-y-auto border-r border-white/10 bg-[#151120] px-5 py-7">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-5 rounded-lg p-2 text-white"
              >
                <FiX size={22} />
              </button>

              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-5 pb-14 pt-5 sm:px-8 lg:px-10 lg:pt-9 xl:px-14">
          <header className="mb-9 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 lg:hidden"
            >
              <FiMenu size={22} />
            </button>

            <div className="lg:hidden">
              <Brand />
            </div>

            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a59cb9]">
                Welcome to the arena
              </p>

              <h1 className="mt-1 text-2xl font-extrabold">
                Game Dashboard
              </h1>
            </div>
          </header>

          <section
            className="relative isolate overflow-hidden rounded-[28px] border border-pink-400/20 bg-[linear-gradient(115deg,#30203e_0%,#24172f_52%,#1b1730_100%)] px-6 py-9 sm:px-10 sm:py-12 xl:px-14"
            aria-labelledby="hero-heading"
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-pink-500/20 blur-[85px]" />

            <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-80 bg-violet-500/10 blur-[65px]" />

            <div className="relative z-10 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#ff9bcd]">
                <span className="h-2 w-2 rounded-full bg-[#ff63b0]" />
                Ready to roll?
              </div>

              <h2
                id="hero-heading"
                className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl xl:text-6xl"
              >
                Roll the dice.
                <br />
                <span className="text-[#ff65b0]">
                  Own the game.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-[#c5b9d0] sm:text-base">
                Take a chance, build your score and challenge
                your friends. One roll could change everything.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/live-game/setup"
                  className="inline-flex items-center gap-3 rounded-xl bg-[#f344a0] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_35px_rgba(243,68,160,0.3)] transition hover:bg-[#ff61b3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <FiPlay fill="currentColor" />
                  Play Friends (Live)
                  <FiArrowRight />
                </Link>

                <Link
                  to="/leaderboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3.5 text-sm font-bold transition hover:bg-white/10"
                >
                  Leaderboard
                  <FiChevronRight />
                </Link>
              </div>
            </div>

            <img
              src={mascot}
              alt="Greedy Pig mascot"
              className="pointer-events-none relative z-0 mx-auto mt-6 h-52 w-52 object-contain drop-shadow-[0_20px_30px_rgba(255,76,160,0.2)] sm:absolute sm:bottom-4 sm:right-0 sm:mt-0 sm:h-64 sm:w-64 xl:right-8 xl:h-80 xl:w-80"
            />
          </section>

          <section
            className="mt-11"
            aria-labelledby="explore-heading"
          >
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff83c1]">
                Beyond the dice
              </p>

              <h2
                id="explore-heading"
                className="mt-2 text-2xl font-extrabold sm:text-3xl"
              >
                Explore the arena
              </h2>

              <p className="mt-2 text-sm text-[#aaa5be]">
                Discover your progress, achievements and game history.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((item) => (
                <FeatureCard
                  key={item.title}
                  {...item}
                />
              ))}
            </div>
          </section>

          <section className="mt-10 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(100deg,#251a37,#1c2333)] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
                The challenge
              </p>

              <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                Feeling lucky?
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#bcb4cb]">
                Keep rolling to grow your score, or pass to
                protect your points. Roll a one and lose
                your turn&apos;s points.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={diceOne}
                alt="Die showing one"
                className="h-14 w-14 object-contain"
              />

              <img
                src={diceSix}
                alt="Die showing six"
                className="h-14 w-14 object-contain"
              />
            </div>
          </section>

          <footer className="mt-9 text-center text-xs text-[#817c99]">
            Greedy Pig · Roll smart. Play bold.
          </footer>
        </main>
      </div>
    </div>
  );
}
