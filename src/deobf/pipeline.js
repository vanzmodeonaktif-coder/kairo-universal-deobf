import { Fingerprint } from './fingerprint.js';
import { StringDecryptor } from './string-decrypt.js';
import { CFFReconstructor } from './cff-reconstructor.js';
import { JunkRemover } from './junk-remover.js';
import { Beautifier } from './beautifier.js';

export class DeobfuscationPipeline {
  constructor(code, options) {
    this.code = code;
    this.options = {
      decryptStrings: true,
      reconstructCFF: true,
      removeJunk: true,
      beautify: true,
      ...options
    };
    this.logs = [];
    this.stats = { originalSize: code.length, finalSize: 0, stagesRun: 0 };
  }

  async execute() {
    let currentCode = this.code;

    // Stage 1: Fingerprinting
    const fingerprint = Fingerprint.analyze(currentCode);
    this.logs.push(`[FINGERPRINT] Detected: ${fingerprint.type} (Confidence: ${fingerprint.confidence}%)`);

    // Stage 2: String Decryption
    if (this.options.decryptStrings) {
      const decryptor = new StringDecryptor(currentCode, fingerprint);
      currentCode = decryptor.process();
      this.logs.push(`[STRING_DECRYPT] Decrypted ${decryptor.stats.decrypted} strings. Removed ${decryptor.stats.tablesRemoved} tables.`);
      this.stats.stagesRun++;
    }

    // Stage 3: CFF Reconstruction
    if (this.options.reconstructCFF && fingerprint.hasCFF) {
      const reconstructor = new CFFReconstructor(currentCode);
      currentCode = reconstructor.process();
      this.logs.push(`[CFF_RECON] Flattened ${reconstructor.stats.loopsResolved} dispatcher loops.`);
      this.stats.stagesRun++;
    }

    // Stage 4: Junk Removal
    if (this.options.removeJunk) {
      const remover = new JunkRemover(currentCode);
      currentCode = remover.process();
      this.logs.push(`[JUNK_REMOVER] Removed ${remover.stats.junksRemoved} junk blocks.`);
      this.stats.stagesRun++;
    }

    // Stage 5: Beautification
    if (this.options.beautify) {
      const beautifier = new Beautifier(currentCode);
      currentCode = beautifier.process();
      this.logs.push(`[BEAUTIFIER] Renamed ${beautifier.stats.varsRenamed} variables. Formatted code.`);
      this.stats.stagesRun++;
    }

    this.stats.finalSize = currentCode.length;
    return {
      success: true,
      code: currentCode,
      logs: this.logs,
      stats: this.stats
    };
  }
}
