import {ColorOptions, IntensitySettings} from "../plugin/api.js";
import {Entry, IEntry} from "../model/Entry.js";
import logger, {LogLevel} from "../util/Log.js";

const log = logger.module('Intensor');
//log.setLevel(LogLevel.debug)

type LinearFn = (x: number) => number;

interface ColorFunctions {
  [index: string]: LinearFn
}

type ColorValue = string;

// Fallback color
const DEFAULT_COLOR = '#e2e2e2';

const DEFAULT_PALETTES = {
   "default": ["#c6e48b", "#7bc96f", "#49af5d", "#2e8840", "#196127",],
}


export const makeLinearFunc = (x1: number, y1: number, x2: number, y2: number): LinearFn => {
  let slope = (y2-y1)/(x2-x1);
  let offset = ((x2*y1)-(x1*y2))/(x2-x1);

  return (x: number) => (x * slope) + offset;
}

export const clamp = (input: number, min: number, max: number): number => {
  return input < min ? min : input > max ? max : input
}

export class Intensor {

  colorFunctions: Map<string, LinearFn>;
  colorNames: string[];
  colors: ColorOptions;

  // DI would be really nice
  constructor(settings: IntensitySettings, colors: ColorOptions, entries: IEntry[]) {
    this.colors = colors;
    this.colorNames = Object.keys(colors);

    if (!this.colorNames.length) {
      throw new Error(`Misconfigured Intensor; no ColorOptions passed`);
    }

    let [ minimumIntensity, maximumIntensity ] = this.getDataRange(entries, settings);

    this.colorFunctions = new Map<string, LinearFn>();

    Object.keys(colors).forEach(key => {
      let colorValues = colors[key];
      let colorSpace = [ 0, colorValues.length ];
      let inputSpace = [ minimumIntensity, maximumIntensity ];

      log.info(`Creating function for "${key}"; mapping inputs(${inputSpace}) to colorspace(${colorSpace})`);

      this.colorFunctions.set(key, makeLinearFunc(inputSpace[0], colorSpace[0], inputSpace[1], colorSpace[1]));
    }, {});
  }

  /**
   * Returns a tuple of numbers, representing the Min and Max
   * input range for mapping functions. Datapoints either higher or lower
   * will
   */
  getDataRange(entries: IEntry[], settings: IntensitySettings): number[] {
    let intensities = entries
      //.filter(e => e.color === paletteName)
      .map(e => new Entry(e))
      .filter(e => e.intensity)
      .map(e => e.intensity as number);

    // Adding one is necessary here for the user inputs to feel right
    // Example, setting min=1 and max=5 will make datapoints at '5' map one lower
    let maxInData = Math.max(...intensities) + 1;
    let minInData = Math.min(...intensities);

    let result = [ minInData, maxInData ];

    if (settings.intensityScaleStart || settings.intensityScaleStart === 0) {
      result[0] = settings.intensityScaleStart;
    }

    if (settings.intensityScaleEnd || settings.intensityScaleEnd === 0) {
      result[1] = settings.intensityScaleEnd + 1;
    }

    return result;
  }

  getDefaultPalette() {
    return this.colorNames[0] || "default";
  }

  mapEntry(entryProps: IEntry): ColorValue {
    let entry = new Entry(entryProps);
    let paletteName = entry.color || this.getDefaultPalette();
    let paletteValues = this.colors[paletteName];

    if (this.colorFunctions.has(paletteName)) {
      let colorFn = this.colorFunctions.get(paletteName);

      if (!colorFn) {
        log.error(`No color function for ${paletteName}`);
        return DEFAULT_COLOR;
      }

      let funcResult = colorFn(entry.intensity);
      let colorIndex = clamp(Math.ceil(funcResult), 0, paletteValues.length - 1);
      let colorValue = paletteValues[colorIndex];

      log.debug(`Mapped value ${entry.intensity} to ${colorValue} (fn: ${funcResult})`);

      return colorValue;

    } else {
      log.error(`No color function found for "${paletteName}" with intensity [${entry.intensity}]`);
      return DEFAULT_COLOR;
    }

  }
}
