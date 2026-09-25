import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { readStorage, writeStorage, removeStorage } from "../storage";

// The full set of named themes a visitor can pick between. Adding a new
// theme is just adding a name here — every Themed<T> value that doesn't
// bother overriding it for that name automatically falls back to `default`.
export const THEME_NAMES = ["magic", "underwater", "forest"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

// `undefined` means "no theme picked" — resolves to `default` everywhere,
// same as any named theme that doesn't override a given value.
export type Theme = ThemeName | undefined;

// Every option a theme picker should list, "no theme" included, in display
// order — so a picker can render one list instead of hand-writing a
// "Default" entry next to a loop over THEME_NAMES.
export const THEME_OPTIONS: Theme[] = [undefined, ...THEME_NAMES];

// Every themed asset (icon, image, ...) must define a `default` — the
// original art — plus however many of the named themes it wants to
// override. A theme that doesn't set one just isn't in the object.
export type Themed<T> = { default: T } & Partial<Record<ThemeName, T>>;

export function resolveThemed<T>(value: Themed<T>, theme: Theme): T {
  if (theme && value[theme] !== undefined) return value[theme];
  return value.default;
}

const STORAGE_KEY = "theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeName(value: unknown): value is ThemeName {
  return THEME_NAMES.includes(value as ThemeName);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = readStorage<ThemeName>(STORAGE_KEY);
    return isThemeName(stored) ? stored : undefined;
  });

  // The chosen theme lives on <html data-theme="..."> so plain CSS (see
  // goofy.css) can react to it the same way component code does via
  // useThemed — one source of truth for both.
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      writeStorage(STORAGE_KEY, theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
      removeStorage(STORAGE_KEY);
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme/useThemed must be used within a ThemeProvider");
  return ctx;
}

// For components that only need the theme name itself (e.g. to resolve
// several themed values in a loop via resolveThemed, without calling a
// hook per item).
export function useTheme(): Theme {
  return useThemeContext().theme;
}

export function useSetTheme(): (theme: Theme) => void {
  return useThemeContext().setTheme;
}

// Convenience for the common case: one themed value, resolved right here.
export function useThemed<T>(value: Themed<T>): T {
  return resolveThemed(value, useTheme());
}
