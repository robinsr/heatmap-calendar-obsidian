import logger from "./Log.js";
import {
  incrementDate,
  getNow,
  getEndOfWeekDate,
  getStartOfWeekDate,
  MONTHS,
  ONE_YEAR_MILI
} from "./DateUtil.js"
import { Layout } from "./Layout.js"
import { IEntry } from './Entry.js'
import {Box, BoxImpl} from "./Box.js"
import SettingsStore from "./SettingsStore.js";

const log = logger.module('RollingLayout');

/**
 * Returns a Date object to use as the starting point for a rolling calendar
 * @return {Date} Date object set to today minus one year
 */
const getRollingStartDate = (): Date => {
  let now = getNow();
  let minusAYear = new Date(now.getTime() - ONE_YEAR_MILI)

  return getStartOfWeekDate(minusAYear, SettingsStore.dayOfWeekStart);
}

const getRollingEndDate = (): Date => {
  let now = getNow();
  return getEndOfWeekDate(now, SettingsStore.dayOfWeekEnd);
}

/**
 * Generates a layout bounded by the current date, and the current date minus 365 days
 */
export class RollingLayout extends Layout {
  private readonly allEntries: IEntry[];

  constructor(entries: IEntry[]) {
    super();
    this.allEntries = entries;
  }

  filterEntries(): IEntry[] {
    let now = getNow();
    // rolling start needs to start one day before to capture
    let startDate = getRollingStartDate();
    let endDate = getRollingEndDate();

    log.info('Start date:', startDate, 'End date:', endDate);

    return [ ...this.allEntries ]
      .filter(e => {
        let eDate = new Date(e.date);
        return eDate >= startDate && eDate <= endDate;
      }) ?? this.allEntries;
  }

  generateBoxes(): Box[] {
    let now = getNow();
    let startDate = getRollingStartDate();
    let endDate = getRollingEndDate();

    let boxes: Box[] = [];

    // End date needs to be incremented one day just for the
    // loop to finish with the final day included
    endDate = incrementDate(endDate);

    let check = 0
    while (startDate < endDate) {
      boxes.push(BoxImpl.fromDate(startDate));
      startDate = incrementDate(startDate);
      check++

      if (check > 390) {
        throw new Error('generateBoxes check thrown. Too many iterations');
      }
    }

    return boxes;
  }

  getMonthLabels(): string[] {
    let monthOffset = getNow().getUTCMonth() + 1;

    let orderedMonths: string[] = [];

    for (let i = 0; i < 12; i++) {
      orderedMonths.push(MONTHS[(monthOffset + i) % 12 ])
    }

    return orderedMonths;
  }
}
