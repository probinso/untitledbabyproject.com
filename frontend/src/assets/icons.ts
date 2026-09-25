import type { Themed } from "./themed";

// Every emoji/icon used across the app, named and in one place to edit.
// Each entry's `default` is the original art; a theme only needs an entry
// here if it wants something different — anything it leaves out falls back
// to `default` automatically (see resolveThemed in ./themed.ts). Purely
// functional icons (record/stop/flip/retake) don't vary by theme at all.
export const icons = {
  logo: { default: "🐣", magic: "🧚", underwater: "🐚", forest: "🦌" },
  home: { default: "🏠", magic: "🏰", underwater: "🐠", forest: "🌲" },
  guestbook: { default: "📝", magic: "📜", underwater: "🫧", forest: "🍃" },
  babyNames: { default: "🍼", magic: "🪄", underwater: "🐙", forest: "🦊" },
  video: { default: "🎥", magic: "✨", underwater: "🐬", forest: "🦉" },
  lullabies: { default: "🎶", magic: "🌟", underwater: "🐳", forest: "🦔" },
  pen: { default: "🖊️" },
  wave: { default: "👋" },
  peekaboo: { default: "🙈" },
  clapperboard: { default: "🎬" },
  confetti: { default: "🎉" },
  record: { default: "🔴" },
  stop: { default: "⏹️" },
  flip: { default: "🔄" },
  retake: { default: "🔁" },
  rocket: { default: "🚀" },
} satisfies Record<string, Themed<string>>;
