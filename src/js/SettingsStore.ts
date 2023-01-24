import {CalendarData} from "./CalendarData.js";
import {DOW} from "./DateUtil.js";


export class SettingsStore {
  private settings: CalendarData;
  private _defaultPalette: string;

  set(initial: CalendarData) {
    // todo - logic for defaults
    this.settings = initial;
  }

  get(prop: keyof CalendarData): any {
    return this.settings[prop];
  }

  set defaultPalette(name: string) {
    this._defaultPalette = name;
  }

  get defaultPalette(): string {
    return this._defaultPalette;
  }

  get dayOfWeekStart(): number {
    return DOW.SUN;
  }

  get dayOfWeekEnd(): number {
    return (this.dayOfWeekStart + 6) % 7;
  }
}

export default new SettingsStore();
