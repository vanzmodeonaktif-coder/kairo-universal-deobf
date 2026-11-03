export class Beautifier {
  constructor(code) {
    this.code = code;
    this.stats = { varsRenamed: 0 };
  }

  process() {
    let result = this.code;
    let varCount = 0;

    // Rename obfuscated variables: _0x4A, a, b, c -> var_1, var_2
    const obfVarPattern = /\b(_0x[a-fA-F0-9]+|[a-z])\b/g;
    result = result.replace(obfVarPattern, (match) => {
      if (match.length <= 2 && match !== 'do' && match !== 'end' && match !== 'if' && match !== 'then' && match !== 'local' && match !== 'function' && match !== 'return') {
        varCount++;
        return `var_${varCount}`;
      }
      return match;
    });
    this.stats.varsRenamed = varCount;

    // Basic Indentation (Simplified)
    result = this.formatIndentation(result);

    return result;
  }

  formatIndentation(code) {
    let indent = 0;
    const lines = code.split('\n');
    return lines.map(line => {
      line = line.trim();
      if (line.startsWith('end') || line.startsWith('else') || line.startsWith('elseif')) indent = Math.max(0, indent - 1);
      const formatted = '    '.repeat(indent) + line;
      if (line.endsWith('then') || line.endsWith('do') || line.endsWith('else') || line.startsWith('function')) indent++;
      return formatted;
    }).join('\n');
  }
}
