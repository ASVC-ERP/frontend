// Dev-only logging.
//
// Vite replaces `import.meta.env.DEV` with a literal boolean at build time, so
// in a production build these calls become `if (false) { ... }` and are
// dead-code-eliminated. In `vite dev` they behave like console.log.

/* eslint-disable no-console */
export function debug(...args) {
  if (import.meta.env.DEV) console.log(...args);
}

export function debugWarn(...args) {
  if (import.meta.env.DEV) console.warn(...args);
}
