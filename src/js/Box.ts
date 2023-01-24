import { IEntry } from "./Entry.js";
import {getDateString, isToday} from "./DateUtil.js";
import store from './SettingsStore.js';

export interface Box {
  date: string;
  backgroundColor?: string;
  entry?: IEntry;
  classNames: string;
  content?: any;
}

enum BoxCSS {
  HAS_DATA = 'hasData',
  IS_EMPTY = 'isEmpty',
  TODAY = 'today',
  LEADING = 'notInView'
}

export class BoxImpl implements Box {

  date: string;
  entry: IEntry;

  private classes: string[] = [];

  private constructor(date: string) {
    this.date = date;
  }

  public static fromDate(date: Date, isLeading: boolean = false): BoxImpl {
    let box = new BoxImpl(getDateString(date));

    if (isLeading)
      box.classes.push(BoxCSS.LEADING);

    return box;
  }

  public static fromEntry(entry: IEntry): BoxImpl {
    let boxi = new BoxImpl(entry.date);
    boxi.entry = entry;
    return boxi;
  }

  get backgroundColor() {
    if (this.entry) {
      if (this.entry.color)
        return this.entry.color;

      return '#000'
    }

    if (this.classes.includes(BoxCSS.LEADING)) {
      return 'transparent'
    }

    // todo, what will empty string do?
    return '';
  }

  get content() {
    return this.entry ? this.entry.content : null;
  }

  get classNames(): string {
    this.classes.push(this.entry ? BoxCSS.HAS_DATA : BoxCSS.IS_EMPTY);

    if (store.get('showCurrentDayBorder') && isToday(this.date)) {
      this.classes.push(BoxCSS.TODAY);
    }


    return this.classes.join(' ');
  }
}
