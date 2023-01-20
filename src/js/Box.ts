import { Entry } from "./Entry.js";
import {getDateString} from "./DateUtil.js";

export interface Box {
  date: string;
  backgroundColor?: string;
  entry?: Entry;
  classNames: string;
  content?: any;
  // addClass: (className: string) => void;
  // removeClass: (className: string) => void;
}

export class BoxImpl implements Box {

  static fromDate(date: Date): BoxImpl {
    return new BoxImpl(getDateString(date));
  }

  static fromEntry(entry: Entry): BoxImpl {
    let boxi = new BoxImpl(entry.date);

    boxi.entry = entry;

    return boxi;
  }

  date: string;
  entry: Entry;
  classNames: string;

  constructor(date: string) {
    this.date = date;
  }

  get backgroundColor() {
    return ''
  }

  get content() {
    return this.entry ? this.entry.content : '';
  }
}
