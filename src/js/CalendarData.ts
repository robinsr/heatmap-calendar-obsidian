import { IEntry } from "./Entry.js";

// type ColorPaletteValues = Array<string>;
// type ColorPaletteKey = string | number;
// export type ColorsDictionary = Map<ColorPaletteKey, ColorPaletteValues>

// Alternatively can use a named
export interface ColorOptions {
  [index: string | number]: string[]
}

export interface IntensitySettings {
  intensityScaleStart?: number;
  intensityScaleEnd?: number;
  defaultEntryIntensity?: number;
}

export interface CalendarData extends IntensitySettings {
  year?: number,
  rolling?: boolean,
  colors: ColorOptions,
  entries: IEntry[]
  showCurrentDayBorder: boolean
}
