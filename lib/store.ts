/**
 * In-memory defense state for the cracking demo, scoped by session code so two
 * classes running at once don't affect each other. Held on globalThis so route
 * handlers and server components share one instance and it survives dev hot reloads.
 */
import { normalizeEmail, normalizeSessionCode } from "@/lib/normalize";

export type Config = {
  rateLimit: boolean; // enforce a minimum gap between attempts per account
  rateLimitMs: number;
  lockout: boolean; // lock an account after N failed attempts
  lockoutThreshold: number;
  lockoutSeconds: number;
};

const DEFAULT_CONFIG: Config = {
  rateLimit: false,
  rateLimitMs: 500,
  lockout: false,
  lockoutThreshold: 5,
  lockoutSeconds: 30,
};

type AttemptState = { fails: number; lockedUntil: number; lastAttempt: number };

type Store = {
  configs: Map<string, Config>;
  attempts: Map<string, Map<string, AttemptState>>; // sessionCode -> "site:email" -> state
};

const g = globalThis as unknown as { __demoStore?: Store };
const store: Store = (g.__demoStore ??= { configs: new Map(), attempts: new Map() });

export function getConfig(sessionCode: string): Config {
  return store.configs.get(normalizeSessionCode(sessionCode)) ?? { ...DEFAULT_CONFIG };
}

export function updateConfig(sessionCode: string, patch: Partial<Config>): Config {
  const next = { ...getConfig(sessionCode), ...patch };
  store.configs.set(normalizeSessionCode(sessionCode), next);
  return next;
}

export function resetAttempts(sessionCode: string) {
  store.attempts.delete(normalizeSessionCode(sessionCode));
}

function getState(sessionCode: string, siteSlug: string, email: string): AttemptState {
  const code = normalizeSessionCode(sessionCode);
  let accounts = store.attempts.get(code);
  if (!accounts) {
    accounts = new Map();
    store.attempts.set(code, accounts);
  }
  const key = `${siteSlug}:${normalizeEmail(email)}`;
  let state = accounts.get(key);
  if (!state) {
    state = { fails: 0, lockedUntil: 0, lastAttempt: 0 };
    accounts.set(key, state);
  }
  return state;
}

export type AttemptCheck =
  | { allowed: true }
  | { allowed: false; reason: "lockout" | "rate-limit"; retryAfterMs: number };

/**
 * Call once per guess, BEFORE verifying the password. It runs synchronously, so
 * parallel requests can't slip past it. The attempt is counted as a failure up
 * front (and cleared by recordSuccess). Otherwise 20 in-flight bcrypt checks
 * would all pass before the first failure was recorded.
 */
export function beginAttempt(sessionCode: string, siteSlug: string, email: string): AttemptCheck {
  const cfg = getConfig(sessionCode);
  const state = getState(sessionCode, siteSlug, email);
  const now = Date.now();

  if (cfg.lockout && state.lockedUntil > now) {
    return { allowed: false, reason: "lockout", retryAfterMs: state.lockedUntil - now };
  }
  if (cfg.rateLimit && now - state.lastAttempt < cfg.rateLimitMs) {
    return { allowed: false, reason: "rate-limit", retryAfterMs: cfg.rateLimitMs - (now - state.lastAttempt) };
  }

  state.lastAttempt = now;
  if (cfg.lockout) {
    state.fails += 1;
    if (state.fails >= cfg.lockoutThreshold) {
      state.lockedUntil = now + cfg.lockoutSeconds * 1000;
      state.fails = 0;
    }
  }
  return { allowed: true };
}

export function recordSuccess(sessionCode: string, siteSlug: string, email: string) {
  const state = getState(sessionCode, siteSlug, email);
  state.fails = 0;
  state.lockedUntil = 0;
}
