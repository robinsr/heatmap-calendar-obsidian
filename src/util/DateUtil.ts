/**
 * Utilities for parsing and formatting date strings
 *
 * To prevent timezone errors (off-by-one errors), everything is done
 * in UTC, with time info ignored. This should be sufficient as
 * Obsidian daily notes only use a year-month-day format
 */


export const ONE_DAY_MILI: number = 1000 * 60 * 60 * 24

// Does not account for leap years
export const ONE_YEAR_MILI: number = ONE_DAY_MILI * 365

export const DOW = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
}

export const MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]


// export for test
export const padLeft = (input: string | number, length: number) => {
  let str = input.toString()

  while (str.length < length)
    str = '0' + str

  return str
}

/**
 * Returns the corresponding date string (YYYY-MM-DD) for a given Date object
 */
export const getDateString = (date: Date): string => {
  return [date.getUTCFullYear(), padLeft(date.getUTCMonth() + 1, 2), padLeft(date.getUTCDate(), 2)].join('-')
}

/**
 * Compares two dates for equality, ignoring any time differences (hours etc)
 * String arguments are assumed to match YYYY-MM-DD format
 */
export const datesMatch = (d1: Date | string, d2: Date | string): boolean => {
  if (typeof d1 !== 'string')
    d1 = getDateString(d1)


  if (typeof d2 !== 'string')
    d2 = getDateString(d2)

  return d1 === d2;
}

/**
 * Returns a new date object with 24 hours added
 */
export const incrementDate = (date: Date, count: number = 1): Date => {
  return new Date(date.getTime() + (ONE_DAY_MILI * count));
}

/**
 * Returns a new date object with 24 hours subtracted
 */
export const decrementDate = (date: Date, count: number = 1): Date => {
  return new Date(date.getTime() - (ONE_DAY_MILI * count));
}

/**
 * Zeros out time info of a date object
 */
export const timeFloorDate = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0))
}

/**
 * Returns a new date object for the runtime day
 */
export const getNow = (): Date => {
  return timeFloorDate(new Date(Date.now()))
}

/**
 * Check if a ISO date string matches the runtime day
 */
export const isToday = (date: string): boolean => {
  return datesMatch(date, getNow());
}

/**
 * Returns a date object representing the day that ends the week of the input date
 *
 * For me a week ends on a Saturday, but this should absolutely
 * be made configurable for regional/personal preferences
 */
export const getEndOfWeekDate = (midweekDate: Date, endOfWeek: number = DOW.SAT): Date => {
  let endDate = timeFloorDate(midweekDate);

  while (endDate.getUTCDay() !== endOfWeek)
    endDate = incrementDate(endDate)

  return endDate;
}

/**
 * Returns a date object representing the day that began the week of the input date
 *
 */
export const getStartOfWeekDate = (midweekDate: Date, startOfWeek: number = DOW.SUN): Date => {
  let startDate = timeFloorDate(midweekDate)

  while (startDate.getUTCDay() !== startOfWeek)
    startDate = decrementDate(startDate)

  return startDate;
}


