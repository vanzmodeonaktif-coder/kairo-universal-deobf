export class StringDecryptor {
  constructor(code, fingerprint) {
    this.code = code;
    this.fingerprint = fingerprint;
    this.stats = { decrypted: 0, tablesRemoved: 0 };
  }

  process() {
    let result = this.code;

    // 1. Decrypt XOR Patterns (e.g., bit32.bxor(byte, key))
    result = this.decryptXOR(result);

    // 2. Decrypt String Char Tables (e.g., string.char(72, 101, 108, 108, 111))
    result = this.decryptCharTables(result);

    // 3. Remove Empty/Unused Tables (Cleanup)
    result = this.removeUnusedTables(result);

    return result;
  }

  decryptXOR(code) {
    // Regex buat cari pola: bit32.bxor(string.byte(str, i), key) atau sejenisnya
    // Ini simplified version. Di production, lu perlu parser AST.
    const xorPattern = /bit32\.bxor\(\s*string\.byte\(\s*([^,]+),\s*([^)]+)\)\s*,\s*([^)]+)\)/g;
    return code.replace(xorPattern, (match, str, idx, key) => {
      // Simulasi decrypt (di real env, lu eval atau parse value-nya)
      this.stats.decrypted++;
      return `"DECRYPTED_XOR_${this.stats.decrypted}"`; 
    });
  }

  decryptCharTables(code) {
    const charPattern = /string\.char\(([\d,\s]+)\)/g;
    return code.replace(charPattern, (match, args) => {
      try {
        const bytes = args.split(',').map(b => parseInt(b.trim()));
        const str = String.fromCharCode(...bytes);
        this.stats.decrypted++;
        return `"${str.replace(/"/g, '\\"')}"`;
      } catch (e) {
        return match;
      }
    });
  }

  removeUnusedTables(code) {
    // Hapus tabel string besar yang udah di-decrypt
    const tablePattern = /local\s+[a-zA-Z0-9_]+\s*=\s*\{\s*(?:"\\"[0-9\\]+",?\s*)+\}/g;
    const result = code.replace(tablePattern, '');
    this.stats.tablesRemoved = (code.match(tablePattern) || []).length;
    return result;
  }
}
