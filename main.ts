import {Plugin} from 'obsidian';

import logger, {LogLevel} from "./src/js/Log.js";
import SettingsStore from 'src/js/SettingsStore.js';
import {Box} from "./src/js/Box.js";
import {CalendarData} from "./src/js/CalendarData.js";
import {RollingLayout} from "./src/js/RollingLayout.js";
import {YearLayout} from "./src/js/YearLayout.js";
import {Layout} from "./src/js/Layout.js";
import {Intensor} from "./src/js/Intensor.js";


const DEFAULT_SETTINGS: CalendarData = {
  year: new Date().getUTCFullYear(),
  colors: {
    default: ["#c6e48b", "#7bc96f", "#49af5d", "#2e8840", "#196127",],
  },
  entries: [{date: "1900-01-01", color: "#7bc96f", intensity: 5, content: "",},],
  showCurrentDayBorder: true,
  defaultEntryIntensity: 4,
  intensityScaleStart: 1,
  intensityScaleEnd: 5,
}


export default class HeatmapCalendar extends Plugin {

  settings: CalendarData

  async onload() {


    logger.setLevel(LogLevel.info);

    await this.loadSettings()

    //@ts-ignore
    window.renderHeatmapCalendar = (el: HTMLElement, calendarData: CalendarData): void => {

      const year = calendarData.year ?? this.settings.year;
      const colors = calendarData.colors ?? this.settings.colors;

      SettingsStore.set(calendarData);

      const allEntries = calendarData.entries;

      const layout: Layout = calendarData.rolling ? new RollingLayout(allEntries) : new YearLayout(year!, allEntries);

      // Filter entries to just those in view
      const calEntries = layout.filterEntries();

      let intensor = new Intensor(calendarData, colors, calEntries);

      // Create the full set of render boxes
      const boxes: Array<Box> = layout.generateBoxes();

      // Match up entries to boxes
      calEntries.forEach(e => {
        let match = boxes.find(b => b.date === e.date);

        if (match) {
          match.entry = e;
        }

        // And resolve intensity to a hex value
        e.color = intensor.mapEntry(e);
      });

      const heatmapCalendarGraphDiv = createDiv({
        cls: "heatmap-calendar-graph",
        parent: el,
      })

      createDiv({
        cls: "heatmap-calendar-year",
        text: String(year).slice(2),
        parent: heatmapCalendarGraphDiv,
      })

      const heatmapCalendarMonthsUl = createEl("ul", {
        cls: "heatmap-calendar-months",
        parent: heatmapCalendarGraphDiv,
      })

      layout.getMonthLabels().forEach(ml => {
        createEl("li", { text: ml, parent: heatmapCalendarMonthsUl, })
      });

      const heatmapCalendarDaysUl = createEl("ul", {
        cls: "heatmap-calendar-days",
        parent: heatmapCalendarGraphDiv,
      });

      layout.getDayOfWeekLabels().forEach(dow => {
        createEl("li", {text: dow, parent: heatmapCalendarDaysUl,})
      });

      const heatmapCalendarBoxesUl = createEl("ul", {
        cls: "heatmap-calendar-boxes",
        parent: heatmapCalendarGraphDiv,
      })

      boxes.forEach(e => {
        createEl("li", {
          text: e.content,
          attr: {
            ...e.backgroundColor && {style: `background-color: ${e.backgroundColor};`,},
          },
          cls: e.classNames,
          parent: heatmapCalendarBoxesUl,
        })
      })
    }
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
