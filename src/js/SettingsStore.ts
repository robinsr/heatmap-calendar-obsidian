import {CalendarData} from "./CalendarData.js";



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
    return 1; // Monday
  }

  get dayOfWeekEnd(): number {
    return 0; // Sunday
  }
}

export default new SettingsStore();
