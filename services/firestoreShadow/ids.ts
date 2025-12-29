/**
 * 🆔 SHADOW DOCUMENT ID BUILDER
 * =============================
 */

/**
 * Creates a stable, URL-safe and Firestore-safe document ID.
 * Pattern: TYPE__KEY1__KEY2__AUTHORITATIVE_HASH
 */
export function shadowDocId(parts: (string | number)[]): string {
  return parts
    .map(p => String(p).replace(/[\/\s]/g, '_')) // Sanitize delimiters
    .join('__');
}
