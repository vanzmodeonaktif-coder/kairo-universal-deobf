export class JunkRemover {
  constructor(code) {
    this.code = code;
    this.stats = { junksRemoved: 0 };
  }

  process() {
    let result = this.code;

    // 1. Remove Dead Loops: while false do ... end
    result = result.replace(/while\s+false\s+do\s*[\s\S]*?end/g, () => {
      this.stats.junksRemoved++;
      return '';
    });

    // 2. Remove Fake Math Junk: local x = 274 * (0 + 1 - 1)
    result = result.replace(/local\s+[a-zA-Z0-9_]+\s*=\s*[\d\+\-\*\(\)\s]+/g, (match) => {
      if (/0\s*\+\s*1\s*-\s*1/.test(match)) {
        this.stats.junksRemoved++;
        return '';
      }
      return match;
    });

    // 3. Remove Unused Variables (Simple heuristic)
    // (Butuh AST parser buat akurasi 100%, ini regex basic)
    
    return result;
  }
}
