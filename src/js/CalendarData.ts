import { Entry } from "./Entry";

interface ColorOptions {
  [index: string | number]: {
    [index: number]: string
  }
}

export interface CalendarData {
  year?: number,
  rolling?: boolean,
  colors: ColorOptions,
  entries: Entry[]
  showCurrentDayBorder: boolean
  defaultEntryIntensity: number
  intensityScaleStart: number
  intensityScaleEnd: number
}
