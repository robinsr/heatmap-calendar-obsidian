

export interface Entry {
  date: string
  intensity?: number
  color?: string
  content?: string
  _date?: Date
}


export class EntryFactory {

  //settings: CalendarData;
  defaultIntensity: number

  // DI would be really nice
  // constructor(settings: CalendarData) {
  //   this.defaultIntensity = settings.defaultEntryIntensity;
  // }

  newEntry(date: string): Entry {
    return { date, intensity: this.defaultIntensity }
  }
}
