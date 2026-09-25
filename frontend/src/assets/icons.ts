import type { Themed } from "./themed";

// Every emoji/icon used across the app, named and in one place to edit.
// Most have a dark-mode variant with a bit of a haunted-house twist; purely
// functional ones (record/stop/flip/retake) stay the same in both.
export const icons = {
  logo: { light: "🐣", dark: "🦇" },
  home: { light: "🏠", dark: "🏚️" },
  guestbook: { light: "📝", dark: "🕯️" },
  babyNames: { light: "🍼", dark: "🎃" },
  video: { light: "🎥", dark: "👻" },
  lullabies: { light: "🎶", dark: "🦉" },
  pen: { light: "🖊️", dark: "🩸" },
  wave: { light: "👋", dark: "👋" },
  peekaboo: { light: "🙈", dark: "💀" },
  clapperboard: { light: "🎬", dark: "🎬" },
  confetti: { light: "🎉", dark: "🎉" },
  record: { light: "🔴", dark: "🔴" },
  stop: { light: "⏹️", dark: "⏹️" },
  flip: { light: "🔄", dark: "🔄" },
  retake: { light: "🔁", dark: "🔁" },
  rocket: { light: "🚀", dark: "🧹" },
  // The toggle button itself: shows what you'd switch *to*.
  themeToggle: { light: "🌙", dark: "☀️" },
} satisfies Record<string, Themed<string>>;
