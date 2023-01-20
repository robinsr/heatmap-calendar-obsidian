import {CalendarData} from "./CalendarData";
import {Entry} from "./Entry";

/**
 * Contains logic for determining the "intensity" (color) of specific boxes
 */
export class IntensityResolver {

  settings: CalendarData

  defaultEntryIntensity: number;
  minimumIntensity: number;
  maximumIntensity: number;
  intensityScaleStart: number;
  intensityScaleEnd: number;

  // DI would be really nice
  constructor(calendarData: CalendarData, calendarEntries: Entry[]) {
    this.settings = calendarData;

    let intensities = calendarEntries.filter(e => e.intensity).map(e => e.intensity as number);

    this.defaultEntryIntensity = calendarData.defaultEntryIntensity ?? calendarData.defaultEntryIntensity
    this.minimumIntensity = intensities.length ? Math.min(...intensities) : calendarData.intensityScaleStart
    this.maximumIntensity = intensities.length ? Math.max(...intensities) : calendarData.intensityScaleEnd
    this.intensityScaleStart = calendarData.intensityScaleStart ?? this.minimumIntensity
    this.intensityScaleEnd = calendarData.intensityScaleEnd ?? this.maximumIntensity
  }

  /**
   * Returns true if the heatmap is configured with one color, and
   * boxes can have either a "on" or "off" state
   */
  isBinary(): boolean {
    const { minimumIntensity, maximumIntensity, intensityScaleStart, intensityScaleEnd } = this;
    return (minimumIntensity === maximumIntensity && intensityScaleStart === intensityScaleEnd)
  }

}
