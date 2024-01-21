import SettingsStore from "../plugin/SettingsStore.js";
import {IEntry} from './Entry.js';
import {Box} from './Box.js';

let DOW_LABELS = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

export class Layout {
  // todo doc
  filterEntries(): IEntry[] {
    throw new Error('Not Implemented');
  }

  // todo doc
  generateBoxes(): Box[] {
    throw new Error('Not Implemented');
  }

  getMonthLabels(): string[] {
    throw new Error('Not Implemented');
  }

  getDayOfWeekLabels(): string[] {
    let dowStart = SettingsStore.dayOfWeekStart;
    return [ ...DOW_LABELS.slice(dowStart), ...DOW_LABELS.slice(0, dowStart) ]
  }

  private get startDayOfWeek() {
    return SettingsStore.dayOfWeekStart;
  }
}
