import {App, PluginSettingTab, Setting} from "obsidian";
import HeatmapCalendarPlugin from "../../main.js";
import {DOW} from "./DateUtil.js";

const DOW_OPTIONS: Record<string, string> = {
  '0': 'Sunday',
  '1': 'Monday',
}


export default class HeatmapCalendarSettingsTab extends PluginSettingTab {
  plugin: HeatmapCalendarPlugin;

  constructor(app: App, plugin: HeatmapCalendarPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("First Day of Week")
      .setDesc("Day of week to start on")
      .addDropdown(dropdown => {
        dropdown
          .addOptions(DOW_OPTIONS)
          .setValue(this.plugin.settings.startDayOfWeek.toString())
          .onChange(async value => {
            console.log(value)
            this.plugin.settings.startDayOfWeek = parseInt(value);
            await this.plugin.saveSettings();
          })
      })
  }
}
