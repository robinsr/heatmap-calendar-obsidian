import * as Console from "console";

export enum LogLevel {
  off,
  error,
  info,
  debug
}

type logFn = typeof Console.info | typeof Console.debug | typeof Console.error;

const NAME = 'HeatmapCalendar'

let level = LogLevel.error;

export const setLevel = (newLevel: LogLevel) => {
  console.log('Global level change', newLevel)
  level = newLevel;
}

export class Logger {
  modLevel: LogLevel;
  modName: string = '';

  constructor(level?: LogLevel, mod?: string) {
    if (level) {
      this.modLevel = level;
    }

    if (mod) {
      this.modName = ` ${mod}:`;
    }
  }

  setLevel(level: LogLevel) {
    this.modLevel = level;
  }

  get level() {
    return this.modLevel || level;
  }

  private log(fn: logFn, ...args: any[]): void {
    fn(NAME, ...args);
  }

  info(...args: any[]): void {
    if (this.level >= LogLevel.info) {
      this.log(console.info, '[INFO]' + this.modName, ...args);
    }
  }

  debug(...args: any[]): void {
    if (this.level >= LogLevel.debug) {
      this.log(console.debug, '[DEBUG]' + this.modName, ...args);
    }
  }

  error(...args: any[]): void {
    if (this.level >= LogLevel.error) {
      this.log(console.error, '[ERROR]' + this.modName, ...args);
    }
  }

  module(moduleName: string): Logger {
    return new Logger(this.modLevel, moduleName);
  }
}

export default new Logger();
