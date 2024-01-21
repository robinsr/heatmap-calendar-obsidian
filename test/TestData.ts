import {IEntry} from "../src/model/Entry.js";

export const TEST_YEAR = '2019';
export const PREV_YEAR = '2018';

const formatDay = (day: string): string => {
  let char = day.slice(-1);
  if (char === '1') return day + 'st';
  if (char === '2') return day + 'nd';
  if (char === '3') return day + 'rd';
  return day + 'th';
}

const months = new Map<string, string>([
  [ '01', 'Jan' ],
  [ '02', 'Feb' ],
  [ '03', 'Mar' ],
  [ '04', 'Apr' ],
  [ '05', 'May' ],
  [ '06', 'Jun' ],
  [ '07', 'Jul' ],
  [ '08', 'Aug' ],
  [ '09', 'Sep' ],
  [ '10', 'Oct' ],
  [ '11', 'Nov' ],
  [ '12', 'Dec' ]
]);

const formatMo = (mo: string): string => {
  // TIL: typescript non-null assertion operator
  return months.has(mo) ? months.get(mo)! : 'Oops';
}

export const newTestEntry = (
  month: string,
  day: string,
  year: string = TEST_YEAR,
  intensity?: number,
  color?: string
): IEntry => {
  let e: IEntry = {
    date: `${year}-${month}-${day}`, // Ex '2018-06-16',
    content: `${formatMo(month)} ${formatDay(day)}, ${year}`, // Ex: "Jun 16th, 2018"
  }

  if (intensity !== undefined) {
    e.intensity = intensity;
  }

  if (color) {
    e.color = color;
  }

  //console.log(e);

  return e;
}
