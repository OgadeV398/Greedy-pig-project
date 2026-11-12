import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  FiVolume2,
  FiVolumeX,
  FiEye,
  FiType,
  FiZap,
  FiCommand,
  FiRefreshCw,
  FiCheckCircle,
  FiSettings,
  FiInfo,
} from "react-icons/fi";

import {
  PremiumLayout,
  Panel,
} from "../components/PremiumLayout";

const STORAGE_KEY = "greedy-pig-accessibility";

const defaultSettings = {
  soundEffects: true,
  highContrast: false,
  reducedMotion: false,
  textSize: "normal",
};

function readSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    return {
      ...defaultSettings,
      ...(saved || {}),
    };
  } catch {
    return { ...defaultSettings };
  }
}

function ToggleSetting({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-5 last:border-b-0">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-400/10 text-pink-300">
          <Icon size={21} />
        </div>

        <div>
          <h3 className="font-bold text-white">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <label className="relative shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          className="peer sr-only"
          aria-label={title}
        />

        <span className="block h-7 w-12 rounded-full bg-slate-600 transition peer-checked:bg-pink-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-pink-300" />

        <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

ToggleSetting.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function Accessibility() {
  const [settings, setSettings] = useState(readSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.gpContrast = settings.highContrast
      ? "high"
      : "normal";

    root.dataset.gpMotion = settings.reducedMotion
      ? "reduced"
      : "normal";

    root.dataset.gpText = settings.textSize;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.warn("Could not save preferences:", error);
    }
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setMessage("Preferences updated.");
  }

  function resetSettings() {
    setSettings({ ...defaultSettings });
    setMessage("Default settings restored.");
  }

  return (
    <PremiumLayout
      eyebrow="Accessibility & Experience"
      title="Accessibility Settings"
      description="Make Greedy Pig more comfortable and easier to use with settings that suit your preferences."
    >
      <div className="mb-6 rounded-2xl border border-pink-400/20 bg-gradient-to-r from-[#33203f] to-[#211c30] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-pink-400/15 p-3 text-pink-300">
            <FiSettings size={26} />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              Play your way
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Customise how the game looks and feels.
              Your preferences are saved on this device.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center gap-3">
            <FiVolume2
              className="text-pink-300"
              size={22}
            />

            <h2 className="text-xl font-extrabold text-white">
              Audio Preferences
            </h2>
          </div>

          <ToggleSetting
            icon={
              settings.soundEffects
                ? FiVolume2
                : FiVolumeX
            }
            title="Sound Effects"
            description="Choose whether game sound effects should play. Game audio must be connected to this preference."
            checked={settings.soundEffects}
            onChange={(value) =>
              updateSetting("soundEffects", value)
            }
          />
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center gap-3">
            <FiEye
              className="text-violet-300"
              size={22}
            />

            <h2 className="text-xl font-extrabold text-white">
              Visual Preferences
            </h2>
          </div>

          <ToggleSetting
            icon={FiEye}
            title="High Contrast"
            description="Increase contrast between text, borders and backgrounds."
            checked={settings.highContrast}
            onChange={(value) =>
              updateSetting("highContrast", value)
            }
          />

          <ToggleSetting
            icon={FiZap}
            title="Reduce Motion"
            description="Reduce animations and movement throughout the interface."
            checked={settings.reducedMotion}
            onChange={(value) =>
              updateSetting("reducedMotion", value)
            }
          />
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center gap-3">
            <FiType
              className="text-teal-300"
              size={22}
            />

            <h2 className="text-xl font-extrabold text-white">
              Text Size
            </h2>
          </div>

          <p className="mb-5 text-sm leading-6 text-slate-400">
            Choose the text size that feels most comfortable.
          </p>

          <fieldset>
            <legend className="sr-only">
              Preferred text size
            </legend>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Normal", value: "normal" },
                { label: "Large", value: "large" },
                { label: "Extra Large", value: "extra" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                    settings.textSize === option.value
                      ? "border-pink-400 bg-pink-400/15 text-pink-200"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="textSize"
                    value={option.value}
                    checked={
                      settings.textSize === option.value
                    }
                    onChange={() =>
                      updateSetting(
                        "textSize",
                        option.value
                      )
                    }
                    className="sr-only"
                  />

                  <span className="block font-bold">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center gap-3">
            <FiCommand
              className="text-pink-300"
              size={22}
            />

            <h2 className="text-xl font-extrabold text-white">
              Keyboard Navigation
            </h2>
          </div>

          <p className="mb-5 text-sm leading-6 text-slate-400">
            Use these standard keyboard controls to navigate
            buttons, links and form fields.
          </p>

          <div className="space-y-4">
            {[
              ["Tab", "Move to the next control"],
              ["Shift + Tab", "Move to the previous control"],
              ["Enter", "Activate a focused button or link"],
              ["Space", "Activate a focused button"],
            ].map(([key, action]) => (
              <div
                key={key}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-b-0"
              >
                <span className="text-sm text-slate-300">
                  {action}
                </span>

                <kbd className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-teal-400/10 p-3 text-teal-300">
            <FiInfo size={22} />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-white">
              Screen Reader Support
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              This settings page uses labelled controls,
              headings and semantic HTML to support
              assistive technologies. Other game screens
              must also be tested and improved individually
              for full screen-reader accessibility.
            </p>
          </div>
        </div>
      </Panel>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={resetSettings}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
        >
          <FiRefreshCw />
          Restore Defaults
        </button>

        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-teal-300"
        >
          {message && (
            <>
              <FiCheckCircle />
              {message}
            </>
          )}
        </div>
      </div>
    </PremiumLayout>
  );
}
