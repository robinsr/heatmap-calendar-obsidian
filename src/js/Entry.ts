import SettingsStore from "./SettingsStore.js";

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
    let defaultI = SettingsStore.get('defaultEntryIntensity');

    // Falsy Zeros are weird
    if (this.entry.intensity === 0) {
      return 0;
    }

    return this.entry.intensity || defaultI || 1;
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
