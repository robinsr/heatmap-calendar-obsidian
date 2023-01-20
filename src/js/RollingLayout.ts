import {
  decrementDate,
  DOW,
  incrementDate,
  getNow,
  timeFloorDate,
  getEndOfWeekDate,
  getStartOfWeekDate, ONE_YEAR_MILI, getDateString
} from "./DateUtil.js"
import { Layout } from "./Layout.js"
import { Entry } from './Entry.js'
import {Box, BoxImpl} from "./Box.js"
import {CalendarData} from "./CalendarData.js";

/**
 * Returns a Date object to use as the starting point for a rolling calendar
 * @return {Date} Date object set to today minus one year
 */
const getRollingStartDate = (): Date => {
  let now = getNow();
  let minusAYear = new Date(now.getTime() - ONE_YEAR_MILI)

  return getStartOfWeekDate(minusAYear);
}

const getRollingEndDate = (): Date => {
  let now = getNow();
  return getEndOfWeekDate(now);
}

/**
 * Generates a layout bounded by the current date, and the current date minus 365 days
 */
export class RollingLayout implements Layout {
  private allEntries: Entry[];
  private showCurrentDayBorder: boolean;

  constructor(settings: CalendarData) {
    this.allEntries = settings.entries;
    this.showCurrentDayBorder = settings.showCurrentDayBorder ?? false;
  }

  filterEntries(): Entry[] {
    let now = getNow();
    // rolling start needs to start one day before to capture
    let startDate = getRollingStartDate();
    let endDate = getRollingEndDate();

    // attempting to reduce the number of times new Date is subsequently called
    // by caching the result into the Entry

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
}
