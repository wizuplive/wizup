/**
 * 💾 FAKE STORAGE ADAPTER
 */

export class FakeStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  // Non-standard helper for inspection
  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of this.map.entries()) out[k] = v;
    return out;
  }
}
