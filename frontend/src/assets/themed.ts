import { useComputedColorScheme } from "@mantine/core";

export interface Themed<T> {
  light: T;
  dark: T;
}

export function resolveThemed<T>(value: Themed<T>, scheme: "light" | "dark"): T {
  return scheme === "dark" ? value.dark : value.light;
}

// For components that only need the scheme itself (e.g. to resolve several
// themed values in a loop via resolveThemed, without calling a hook per item).
export function useColorScheme(): "light" | "dark" {
  return useComputedColorScheme("light");
}

// Convenience for the common case: one themed value, resolved right here.
export function useThemed<T>(value: Themed<T>): T {
  return resolveThemed(value, useColorScheme());
}
