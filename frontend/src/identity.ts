import { readStorage, writeStorage, clearStorage } from "./storage";
import { md5 } from "./md5";

const IDENTITY_KEY = "identity";

// The text someone typed in — never sent to the backend, only used to
// display/edit their identity and to derive the token below.
export function getIdentityRaw(): string | undefined {
  return readStorage<string>(IDENTITY_KEY);
}

// The hash the backend actually deals with. Computing it here means the
// backend never sees, stores, or hashes the raw identity itself.
export function getIdentityToken(): string | undefined {
  const raw = getIdentityRaw();
  return raw !== undefined ? md5(raw) : undefined;
}

export function setIdentity(identity: string) {
  if (getIdentityRaw() !== identity) clearStorage();
  writeStorage(IDENTITY_KEY, identity);
}
