import {YearLayout} from "../src/js/YearLayout.js";
import {IEntry} from "../src/js/Entry.js";

import sinon, {assert, SinonStub} from 'sinon';
import {afterEach} from "mocha";
import {equal} from "assert";
import {expect} from "chai";
import {newTestEntry, PREV_YEAR} from "./TestData.js";



const mockToday = new Date(Date.UTC(2019, 5, 20, 12, 6, 0));

const entry_1229_prev = newTestEntry('12', '29', PREV_YEAR); // Sat
const entry_1230_prev = newTestEntry('12', '30', PREV_YEAR); // Sun
const entry_1231_prev = newTestEntry('12', '31', PREV_YEAR);
const entry_101 = newTestEntry('01', '01');
const entry_102 = newTestEntry('01', '02');
const entry_103 = newTestEntry('06', '20');
const entry_1230 = newTestEntry('12', '30');
const entry_1231 = newTestEntry('12', '31');
const entry_101_next = newTestEntry('01', '01', '2020');
const entry_102_next = newTestEntry('01', '02', '2020');

let testEntries: IEntry[] = [
  entry_1229_prev, entry_1230_prev, entry_1231_prev,
  entry_101, entry_102, entry_103, entry_1230, entry_1231,
  entry_101_next, entry_102_next
];



describe('YearLayout', function () {
    let dateNowStub: SinonStub;

  beforeEach(function () {
    // This feels dirty AF
    dateNowStub = sinon.stub(Date, "now").returns(mockToday.getTime());
  });

  afterEach(function () {
    sinon.restore();
  })

  describe('Date mocking setup', function () {
    it('should return mocked today date', function () {
      let today = new Date(Date.now());
      equal(today.getUTCFullYear(), 2019);
      equal(today.getUTCMonth(), 5);
      equal(today.getUTCDate(), 20);
      equal(today.getUTCDay(), 4); // Thursday
      equal(today.toISOString(), '2019-06-20T12:06:00.000Z', 'ISO string should be fake date');

      assert.callCount(dateNowStub, 1);
    });
  });

  describe('filterEntries', function () {
    it('filters input entries to those of that week', function () {

      let rl = new YearLayout(2019, testEntries);
      let filteredEntries = rl.filterEntries();

      expect(filteredEntries).to.have.length(5);

      expect(filteredEntries).to.contain(entry_101);
      expect(filteredEntries).to.contain(entry_102);
      expect(filteredEntries).to.contain(entry_103);
      expect(filteredEntries).to.contain(entry_1230);
      expect(filteredEntries).to.contain(entry_1230);

      expect(filteredEntries).not.to.contain(entry_1229_prev);
      expect(filteredEntries).not.to.contain(entry_1230_prev);
      expect(filteredEntries).not.to.contain(entry_1231_prev);
      expect(filteredEntries).not.to.contain(entry_101_next);
      expect(filteredEntries).not.to.contain(entry_102_next);

    })
  })

  describe('generateBoxes', function() {
    it('creates a full set of renderable "boxes"', function () {
      let rl = new YearLayout(2019, testEntries);

      let boxes = rl.generateBoxes();

      let dates: string[] = [];
      boxes.forEach(b => {
        if (dates.includes(b.date)) {
          throw new Error(`duplicate date found in box set: ${b.date}`)
        }
        dates.push(b.date)
      })

      expect(boxes[0]).to.have.property('date', '2018-12-31');
      expect(boxes[boxes.length - 1]).to.have.property('date', '2020-01-01');
    })
  })
});
