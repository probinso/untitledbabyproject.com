export function readStorage<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}
