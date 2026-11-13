import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FiArrowLeft,
  FiHome,
  FiPlay,
  FiBarChart2,
  FiAward,
  FiSettings,
  FiUser,
  FiClock,
  FiTrendingUp,
  FiBookOpen,
  FiMenu,
  FiX,
} from "react-icons/fi";

const links = [
  {
    name: "Home",
    path: "/",
    icon: FiHome,
  },
  {
    name: "Play Game",
    path: "/live-game/setup",
    icon: FiPlay,
  },
  {
    name: "Leaderboard",
    path: "/leaderboard",
    icon: FiBarChart2,
  },
  {
    name: "Match History",
    path: "/match-history",
    icon: FiClock,
  },
  {
    name: "Statistics",
    path: "/statistics",
    icon: FiTrendingUp,
  },
  {
    name: "Achievements",
    path: "/achievements",
    icon: FiAward,
  },
  {
    name: "Accessibility",
    path: "/accessibility",
    icon: FiSettings,
  },
  {
    name: "Interactive Tutorial",
    path: "/tutorial",
    icon: FiBookOpen,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: FiUser,
  },
];

function SidebarLinks({ onNavigate }) {
  return (
    <nav className="space-y-2" aria-label="Main navigation">
      {links.map(({ name, path, icon: Icon }) => (
        <NavLink
          key={name}
          to={path}
          end={path === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? "border-pink-400/25 bg-pink-500/15 text-pink-300"
                : "border-transparent text-slate-300 hover:border-pink-400/10 hover:bg-pink-500/10 hover:text-pink-300"
            }`
          }
        >
          <Icon size={18} className="shrink-0" />
          <span>{name}</span>
        </NavLink>
      ))}
    </nav>
  );
}

SidebarLinks.propTypes = {
  onNavigate: PropTypes.func,
};

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2 text-2xl font-black tracking-tight"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400">
          <FiPlay size={20} />
        </span>

        <span>
          GREEDY
          <span className="text-pink-400">PIG</span>
        </span>
      </Link>

      <p className="mb-5 mt-12 text-xs font-bold uppercase tracking-widest text-slate-500">
        Navigation
      </p>

      <SidebarLinks onNavigate={onNavigate} />

      <div className="mt-auto pt-10">
        <div className="rounded-2xl border border-pink-400/10 bg-pink-400/5 p-4">
          <p className="text-sm font-bold text-white">
            Ready to roll?
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Challenge your friends and climb the leaderboard.
          </p>

          <Link
            to="/live-game/setup"
            onClick={onNavigate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-400"
          >
            <FiPlay />
            Play Now
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Roll smart. Play bold.
        </p>
      </div>
    </div>
  );
}

SidebarContent.propTypes = {
  onNavigate: PropTypes.func,
};

export function PremiumLayout({
  children,
  eyebrow,
  title,
  description,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#110e1d] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#171222] p-6 lg:block">
          <div className="sticky top-0 flex h-screen flex-col overflow-y-auto py-2">
            <SidebarContent />
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-black/70"
            />

            <aside className="absolute inset-y-0 left-0 flex w-[min(85vw,320px)] flex-col overflow-y-auto border-r border-white/10 bg-[#171222] p-6 shadow-2xl">
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="mb-6 ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/10"
              >
                <FiX size={22} />
              </button>

              <SidebarContent onNavigate={closeMobileMenu} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <Link
              to="/"
              className="text-xl font-black tracking-tight"
            >
              GREEDY
              <span className="text-pink-400">PIG</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <FiMenu size={22} />
            </button>
          </div>

          {!isHome && (
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-pink-300"
            >
              <FiArrowLeft />
              Back to Home
            </Link>
          )}

          {(eyebrow || title || description) && (
            <header className="mb-8">
              {eyebrow && (
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
                  {eyebrow}
                </p>
              )}

              {title && (
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {title}
                </h1>
              )}

              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  {description}
                </p>
              )}
            </header>
          )}

          {children}

          <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            Greedy Pig · Roll smart. Play bold.
          </footer>
        </main>
      </div>
    </div>
  );
}

PremiumLayout.propTypes = {
  children: PropTypes.node,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
};

export function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[22px] border border-white/10 bg-[#211c30] p-5 shadow-lg sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

Panel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <FiAward className="mb-4 text-pink-400" size={36} />

      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};
