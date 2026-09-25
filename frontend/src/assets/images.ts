import type { Themed } from "./themed";
import ssaLogoLight from "./ssa-logo-light.png";
import ssaLogoDark from "./ssa-logo-dark.png";
import presidentialPortraitLight from "./presidential-portrait-light.png";
import presidentialPortraitDark from "./presidential-portrait-dark.png";

// Dark variants are stubs (same file as light) until real dark-mode art
// replaces them — swap the dark: import above when that's ready.
export const images = {
  ssaLogo: { light: ssaLogoLight, dark: ssaLogoDark },
  presidentialPortrait: { light: presidentialPortraitLight, dark: presidentialPortraitDark },
} satisfies Record<string, Themed<string>>;
