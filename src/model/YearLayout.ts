import logger from "../util/Log.js";
import {getDateString, getNow, getStartOfWeekDate, incrementDate, MONTHS} from "../util/DateUtil.js";
import {Layout} from "./Layout.js";
import {IEntry} from "./Entry.js";
import {Box, BoxImpl} from "./Box.js";
import SettingsStore from "../plugin/SettingsStore.js";

const log = logger.module('YearLayout');

/**
 * Returns a number representing how many days into the year the supplied date is.
 * Example: first of january is 1, third of february is 34 (31+3)
 * @param date
 */
const getHowManyDaysIntoYear = (date: Date): number => {
  return (
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
  )
}

const getHowManyDaysIntoYearLocal = (date: Date): number => {
  return (
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
  )
}


/**
 * Generates a layout bounded by Jan 1st and Dec 31st for a given year
 */
export class YearLayout extends Layout {

  private allEntries: IEntry[];
  private year: number;

  constructor(year: number, entries: IEntry[]) {
    super();
    this.allEntries = entries;
    this.year = year;
  }

  getMonthLabels(): string[] {
    return MONTHS;
  }

  filterEntries(): IEntry[] {
    return this.allEntries.filter(e => new Date(e.date + "T00:00").getUTCFullYear() === this.year) ?? this.allEntries;
  }

  generateBoxes(): Box[] {
    const { year } = this;

    const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
    let leadingDays = getStartOfWeekDate(firstDayOfYear, SettingsStore.dayOfWeekStart);

    log.debug("Year start date:", getDateString(leadingDays), "Year end date:", getDateString(firstDayOfYear));

    const boxes: Array<Box> = []

    while (leadingDays < firstDayOfYear) {
      boxes.push(BoxImpl.fromDate(leadingDays, true))
      leadingDays = incrementDate(leadingDays)
    }

    const lastDayOfYear = new Date(Date.UTC(year, 11, 31))
    const numberOfDaysInYear = getHowManyDaysIntoYear(lastDayOfYear) //eg 365 or 366
    const todaysDayNumberLocal = getHowManyDaysIntoYearLocal(getNow())

    for (let day = 0; day <= numberOfDaysInYear; day++) {
      let boxDate = incrementDate(firstDayOfYear, day);
      boxes.push(BoxImpl.fromDate(boxDate));
    }

    return boxes;
  }
}
