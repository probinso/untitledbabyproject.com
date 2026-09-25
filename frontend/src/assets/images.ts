import type { Themed } from "./themed";
import ssaLogoLight from "./ssa-logo-light.png";
import presidentialPortraitLight from "./presidential-portrait-light.png";

// No theme has its own take on these yet, so every theme just falls back
// to `default` — add a `magic`/`underwater`/`forest` key here once one does.
export const images = {
  ssaLogo: { default: ssaLogoLight },
  presidentialPortrait: { default: presidentialPortraitLight },
} satisfies Record<string, Themed<string>>;
