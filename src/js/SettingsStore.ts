import {InstanceSettings, PluginSettings} from "./CalendarData.js";

export const DEFAULT_CONFIG: InstanceSettings = {
  year: new Date().getUTCFullYear(),
  colors: {
    default: ["#c6e48b", "#7bc96f", "#49af5d", "#2e8840", "#196127",],
  },
  entries: [{date: "1900-01-01", color: "#7bc96f", intensity: 5, content: "",},],
  showCurrentDayBorder: true,
  defaultEntryIntensity: 4,
  intensityScaleStart: 1,
  intensityScaleEnd: 5
}


export class SettingsStore {
  private config: InstanceSettings;
  private settings: PluginSettings;
  private _defaultPalette: string;

  setConfig(initial: InstanceSettings) {
    this.config = initial;
  }

  getConfig(prop: keyof InstanceSettings): any {
    return this.config[prop];
  }

  setSettings(initial: PluginSettings): void {
    this.settings = initial;
  }

  getSetting(prop: keyof PluginSettings): any {
    return this.settings[prop];
  }

  set defaultPalette(name: string) {
    this._defaultPalette = name;
  }

  get defaultPalette(): string {
    return this._defaultPalette;
  }

  get dayOfWeekStart(): number {
    return this.settings.startDayOfWeek;
  }

  get dayOfWeekEnd(): number {
    return (this.dayOfWeekStart + 6) % 7;
  }
}

export default new SettingsStore();
