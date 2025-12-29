/**
 * 🚩 SHADOW READ DEV FLAGS
 * ========================
 */

// Detect development environment
const isDev = typeof process !== 'undefined' 
  ? process.env.NODE_ENV === 'development' 
  : (import.meta as any).env?.MODE === 'development';

/**
 * Global master switch for Firestore Shadow Read.
 * Strictly false in production builds.
 */
export const DEV_FIRESTORE_SHADOW_READ = isDev;

/**
 * Manual local toggle. Developers must set this to true locally
 * to enable the shadow audit tools in the console.
 */
export const ENABLE_SHADOW_READ_TOOLS = false;
