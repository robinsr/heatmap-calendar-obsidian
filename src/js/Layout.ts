import {IEntry} from "./Entry.js";
import {Box} from "./Box.js";

export interface Layout {
  // todo doc
  filterEntries(): IEntry[];

  // todo doc
  generateBoxes(): Box[];
}
