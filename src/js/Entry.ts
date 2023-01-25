import SettingsStore from "./SettingsStore.js";
import {default as logger} from "./Log.js";

const log = logger.module('Entry')

export interface IEntry {
  date: string
  intensity?: number
  color?: string
  content?: string
  _date?: Date
}

export class Entry implements IEntry {
  entry: IEntry;

  constructor(e: IEntry) {
    this.entry = e;
  }

  get date() {
    return this.entry.date;
  }

  get intensity() {
    let defaultI = SettingsStore.getConfig('defaultEntryIntensity');

    if (this.entry.intensity === undefined) {
      log.debug(`Entry ${this.date} intensity is Undefined`)
      return defaultI || 0;
    }

    // Falsy Zeros are weird
    if (this.entry.intensity === 0) {
      log.debug(`Entry ${this.date} intensity is ZER0`)
      return 0;
    }

    return this.entry.intensity;
  }


  // refers to the palette name
  get color() {
    return this.entry.color || SettingsStore.defaultPalette;
  }
}


export class EntryList {

  private entries: IEntry[];

  constructor(entries: IEntry[]) {
     this.entries = entries;
  }
}
