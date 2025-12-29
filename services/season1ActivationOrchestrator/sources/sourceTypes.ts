/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

export interface ReadSource<T> {
  read(key: string): Promise<T | null>;
  fingerprint?(key: string): Promise<string | null>;
}
