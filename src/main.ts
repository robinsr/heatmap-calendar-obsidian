import {Plugin} from 'obsidian';
import logger, {LogLevel} from "./util/Log.js";
import {DEFAULT_CONFIG} from 'src/plugin/SettingsStore.js';
import {InstanceSettings, PluginSettings} from "./plugin/api.js";
import HeatmapCalendar from "./plugin/HeatmapCalendar.js";
import HeatmapCalendarSettingsTab from "./plugin/SettingsTab.js";


export default class HeatmapCalendarPlugin extends Plugin {

  settings: PluginSettings;

  async onload() {
    logger.setLevel(LogLevel.debug);

    await this.loadSettings();

    console.log(this.settings);

    this.addSettingTab(new HeatmapCalendarSettingsTab(this.app, this));

    //@ts-ignore
    window.renderHeatmapCalendar = (el: HTMLElement, config: InstanceSettings) => {
      let mergedConfig = Object.assign({}, DEFAULT_CONFIG, config);

      let heatmap = new HeatmapCalendar(this.settings, mergedConfig);

      heatmap.render(el);
    }
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, { "startDayOfWeek": 0 }, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
