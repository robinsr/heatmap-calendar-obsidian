import {Layout} from "./Layout";
import {Entry} from "./Entry";
import {Box} from "./Box";
import {CalendarData} from "./CalendarData";

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

const clamp = (input: number, min: number, max: number): number => {
  return input < min ? min : input > max ? max : input
}

const map = (current: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const mapped: number = ((current - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  return clamp(mapped, outMin, outMax)
}

/**
 * Generates a layout bounded by Jan 1st and Dec 31st for a given year
 */
export class YearLayout implements Layout {

  private allEntries: Entry[];
  private year: number;
  private showCurrentDayBorder: boolean;

  constructor(settings: CalendarData) {
    this.allEntries = settings.entries;

    if (settings.year) {
      this.year = settings.year;
    } else {
      throw new Error('Error creating YearLayout; settings.year not defined.');
    }

    this.showCurrentDayBorder = settings.showCurrentDayBorder ?? false;
  }


  filterEntries(): Entry[] {
    return this.allEntries.filter(e => new Date(e.date + "T00:00").getFullYear() === this.year) ?? this.allEntries;
  }

  generateBoxes(): Box[] {

    const { allEntries, showCurrentDayBorder, year } = this;

    // const mappedEntries: Entry[] = []
    // allEntries.forEach(e => {
    //   const newEntry = {
    //     intensity: defaultEntryIntensity,
    //     ...e,
    //   }
    //   const colorIntensities = colors[e.color] ?? colors[Object.keys(colors)[0]]
    //   const numOfColorIntensities = Object.keys(colorIntensities).length
    //
    //   if (minimumIntensity === maximumIntensity && intensityScaleStart === intensityScaleEnd) {
    //     newEntry.intensity = numOfColorIntensities;
    //   } else {
    //     newEntry.intensity = Math.round(map(newEntry.intensity, intensityScaleStart, intensityScaleEnd, 1, numOfColorIntensities))
    //   }
    //
    //   mappedEntries[this.getHowManyDaysIntoYear(new Date(e.date))] = newEntry
    // })

    const firstDayOfYear = new Date(Date.UTC(year, 0, 1))
    let numberOfEmptyDaysBeforeYearBegins = (firstDayOfYear.getUTCDay() + 6) % 7


    const boxes: Array<Box> = []

    while (numberOfEmptyDaysBeforeYearBegins) {
      //boxes.push({backgroundColor: "transparent",})
      numberOfEmptyDaysBeforeYearBegins--
    }

    const lastDayOfYear = new Date(Date.UTC(year, 11, 31))
    const numberOfDaysInYear = getHowManyDaysIntoYear(lastDayOfYear) //eg 365 or 366
    const todaysDayNumberLocal = getHowManyDaysIntoYearLocal(new Date())

    for (let day = 1; day <= numberOfDaysInYear; day++) {

      //const box: Box = {}

      //if (day === todaysDayNumberLocal && showCurrentDayBorder) box.classNames?.push("today")
      //
      // if (mappedEntries[day]) {
      //   box.classNames?.push("hasData")
      //   const entry = mappedEntries[day]
      //
      //   box.date = entry.date
      //
      //   if (entry.content) box.content = entry.content
      //
      //   const currentDayColors = entry.color ? colors[entry.color] : colors[Object.keys(colors)[0]]
      //   box.backgroundColor = currentDayColors[entry.intensity as number - 1]

      //} else box.classNames?.push("isEmpty")
      //boxes.push(box)
    }

    return boxes;
  }
}
