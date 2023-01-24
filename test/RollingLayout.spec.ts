import {RollingLayout} from "../src/js/RollingLayout.js";
import {IEntry} from "../src/js/Entry.js";

import sinon, {assert, SinonStub} from 'sinon';
import {afterEach} from "mocha";
import {equal} from "assert";
import {expect} from "chai";
import {newTestEntry, PREV_YEAR} from "./TestData.js";
import {getNow} from "../src/js/DateUtil.js";


/*
  For this test, its essential to assume a unchanging starting point that serves as "today"
    --> Thurs June 20th 2019 - 12:06 PM (UTC)

  We will use Sinon to stub DateUtil to return this value

  The beginning of the time window would be:
    --> Sat June 22nd 2019

  The end of the time would be:
    --> Sun June 17th 2018
 */
const mockToday = new Date(Date.UTC(2019, 5, 20, 12, 6, 0));


/*
  The RollingLayout will filter entries to the current week, including the future days in
  that week. For this test, it should include up tp June 22nd 2019
 */
const entry_619: IEntry = newTestEntry('06', '19');
const entry_620: IEntry = newTestEntry('06', '20');
const entry_621: IEntry = newTestEntry('06', '21');
const entry_622: IEntry = newTestEntry('06', '22');
const entry_623: IEntry = newTestEntry('06', '23');
const entry_624: IEntry = newTestEntry('06', '26');

let testEntries: IEntry[] = [
  entry_619, entry_620, entry_621, entry_622, entry_623, entry_624
];


/*
  And we need entries that occurred before the beginning of the RollingLayout time window
 */
const entry_616_prev: IEntry = newTestEntry('06', '16', PREV_YEAR);
const entry_617_prev: IEntry = newTestEntry('06', '17', PREV_YEAR);
const entry_618_prev: IEntry = newTestEntry('06', '18', PREV_YEAR);

const prevTestEntries: IEntry[] = [
  entry_616_prev, entry_617_prev, entry_618_prev
]

testEntries = [ ...prevTestEntries, ...testEntries ];

describe('RollingLayout', function () {
  let dateNowStub: SinonStub;

  beforeEach(function () {
    dateNowStub = sinon.stub(Date, "now").returns(mockToday.getTime());
  });

  afterEach(function () {
    sinon.restore();
  });

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

      let rl = new RollingLayout(testEntries);
      let filteredEntries = rl.filterEntries();

      assert.called(dateNowStub);

      expect(filteredEntries).to.have.length(6);

      expect(filteredEntries).to.contain(entry_618_prev);
      expect(filteredEntries).to.contain(entry_619);
      expect(filteredEntries).to.contain(entry_620);
      expect(filteredEntries).to.contain(entry_621);
      expect(filteredEntries).to.contain(entry_622);
      expect(filteredEntries).to.contain(entry_623);

      expect(filteredEntries).not.to.contain(entry_616_prev);
      expect(filteredEntries).to.not.contain(entry_617_prev);
      expect(filteredEntries).not.to.contain(entry_624);

    })
  });

  describe('generateBoxes', function() {
    it('creates a full set of renderable "boxes"', function () {
      let rl = new RollingLayout(testEntries);

      let boxes = rl.generateBoxes();

      expect(boxes).to.have.length(371);

      expect(boxes[0]).to.have.property('date', '2018-06-18');
      expect(boxes[boxes.length - 1]).to.have.property('date', '2019-06-23');
    });
  });

  describe('getMonthLabels', function () {
    it('should return 12 month labels in the expected order', function() {
      let rl = new RollingLayout(testEntries);
      let monthLabels = rl.getMonthLabels();

      expect(monthLabels).to.have.length(12);
      expect(monthLabels[0]).to.eq('Jul');
      expect(monthLabels[1]).to.eq('Aug');
      expect(monthLabels[2]).to.eq('Sep');
      expect(monthLabels[3]).to.eq('Oct');
      expect(monthLabels[4]).to.eq('Nov');
      expect(monthLabels[5]).to.eq('Dec');
      expect(monthLabels[6]).to.eq('Jan');
      expect(monthLabels[7]).to.eq('Feb');
      expect(monthLabels[8]).to.eq('Mar');
      expect(monthLabels[9]).to.eq('Apr');
      expect(monthLabels[10]).to.eq('May');
      expect(monthLabels[11]).to.eq('Jun');
    });
  });
});
