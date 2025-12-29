/**
 * 🛠️ INTERNAL DEV FLAGS
 * =====================
 * Gated by environment to prevent accidental production exposure.
 */

// Detect if we are in a development environment
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export const DEV_SEASON_CLOSE_PREVIEW = isDev;
export const DEV_SEASON1_VERIFIER = isDev;
export const DEV_SEASON_OBSERVABILITY = isDev;
export const DEV_AUDIT_EXPORT = isDev;
