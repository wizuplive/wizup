/**
 * Deterministic Hashing for Resolution Artifacts
 */
export const hashing = {
  async generateHash(data: any): Promise<string> {
    const json = JSON.stringify(data, (key, value) => {
      // Ensure stable sorting of objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).sort().reduce((sorted: any, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {});
      }
      return value;
    });

    const encoder = new TextEncoder();
    const bytes = encoder.encode(json);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};
