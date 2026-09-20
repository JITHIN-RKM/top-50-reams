/**
 * ANSI Color codes and formatted logger for Google Search Console CLI and Service.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

export class GscLogger {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.verbose=false]
   * @param {boolean} [options.quiet=false]
   * @param {boolean} [options.colors=true]
   * @param {Function} [options.outputFn] Custom stdout sink (for tests)
   * @param {Function} [options.errorFn] Custom stderr sink (for tests)
   */
  constructor(options = {}) {
    this.verbose = Boolean(options.verbose);
    this.quiet = Boolean(options.quiet);
    this.useColors = options.colors !== undefined ? Boolean(options.colors) : !process.env.NO_COLOR;
    this.out = options.outputFn || console.log;
    this.err = options.errorFn || console.error;
    this.logs = []; // In-memory log buffer for inspection/testing
  }

  colorize(colorKey, text) {
    if (!this.useColors || !colors[colorKey]) {
      return String(text);
    }
    return `${colors[colorKey]}${text}${colors.reset}`;
  }

  _record(level, message) {
    this.logs.push({ level, message, timestamp: new Date().toISOString() });
  }

  info(msg, ...args) {
    this._record('info', msg);
    if (!this.quiet) {
      const prefix = this.colorize('cyan', 'ℹ [INFO]');
      this.out(`${prefix} ${msg}`, ...args);
    }
  }

  success(msg, ...args) {
    this._record('success', msg);
    if (!this.quiet) {
      const prefix = this.colorize('green', '✔ [SUCCESS]');
      this.out(`${prefix} ${msg}`, ...args);
    }
  }

  warn(msg, ...args) {
    this._record('warn', msg);
    if (!this.quiet) {
      const prefix = this.colorize('yellow', '▲ [WARN]');
      this.err(`${prefix} ${msg}`, ...args);
    }
  }

  error(msg, ...args) {
    this._record('error', msg);
    const prefix = this.colorize('red', '✖ [ERROR]');
    this.err(`${prefix} ${msg}`, ...args);
  }

  debug(msg, ...args) {
    this._record('debug', msg);
    if (this.verbose && !this.quiet) {
      const prefix = this.colorize('gray', '⚙ [DEBUG]');
      this.out(`${prefix} ${msg}`, ...args);
    }
  }

  box(title, lines = []) {
    if (this.quiet) return;
    const border = '═'.repeat(60);
    this.out(this.colorize('blue', `╔${border}╗`));
    this.out(this.colorize('blue', `║ `) + this.colorize('bright', title.padEnd(58)) + this.colorize('blue', ` ║`));
    this.out(this.colorize('blue', `╠${border}╣`));
    for (const line of lines) {
      this.out(this.colorize('blue', `║ `) + line.padEnd(58) + this.colorize('blue', ` ║`));
    }
    this.out(this.colorize('blue', `╚${border}╝`));
  }
}

export function createLogger(options = {}) {
  return new GscLogger(options);
}

export const defaultLogger = new GscLogger();
