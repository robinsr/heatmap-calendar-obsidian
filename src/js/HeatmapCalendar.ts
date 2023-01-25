import {CalendarData, InstanceSettings, PluginSettings} from "./CalendarData.js";
import {Box} from "./Box.js";
import {RollingLayout} from "./RollingLayout.js";
import {YearLayout} from "./YearLayout.js";
import {Layout} from "./Layout.js";
import {Intensor} from "./Intensor.js";
import SettingsStore from "./SettingsStore.js";


export default class HeatmapCalendar {

  settings: PluginSettings;
  config: InstanceSettings;

  constructor(settings: PluginSettings, config: InstanceSettings) {
    this.settings = settings;
    this.config = config;
  }

  render(el: HTMLElement) {
    SettingsStore.setConfig(this.config);
    SettingsStore.setSettings(this.settings);

    const { year, rolling, colors, entries } = this.config;

    const layout: Layout = rolling ? new RollingLayout(entries) : new YearLayout(year!, entries);

    // Filter entries to just those in view
    const calEntries = layout.filterEntries();

    let intensor = new Intensor(this.config, colors, calEntries);

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
