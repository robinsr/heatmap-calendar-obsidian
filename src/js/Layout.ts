import {Entry} from "./Entry.js";
import {Box} from "./Box.js";

export interface Layout {
  // todo doc
  filterEntries(): Entry[];

  // todo doc
  generateBoxes(): Box[];
}
