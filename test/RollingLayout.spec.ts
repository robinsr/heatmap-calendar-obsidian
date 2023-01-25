import SettingsStore, {DEFAULT_CONFIG} from "../src/js/SettingsStore.js";
import {RollingLayout} from "../src/js/RollingLayout.js";
import {IEntry} from "../src/js/Entry.js";

import sinon, {assert, SinonStub} from 'sinon';
import {afterEach} from "mocha";
import {equal} from "assert";
import {expect} from "chai";
import {newTestEntry, PREV_YEAR} from "./TestData.js";


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
const entry_619: IEntry = newTestEntry('06', '19'); // Wed
const entry_620: IEntry = newTestEntry('06', '20'); // Thu
const entry_621: IEntry = newTestEntry('06', '21'); // Fri
const entry_622: IEntry = newTestEntry('06', '22'); // Sat
const entry_623: IEntry = newTestEntry('06', '23'); // Sun
const entry_624: IEntry = newTestEntry('06', '24'); // Mon

let testEntries: IEntry[] = [
  entry_619, entry_620, entry_621, entry_622, entry_623, entry_624
];


/*
  And we need entries that occurred before the beginning of the RollingLayout time window
 */
const entry_616_prev: IEntry = newTestEntry('06', '16', PREV_YEAR); // Sat (last if start=SUN)
const entry_617_prev: IEntry = newTestEntry('06', '17', PREV_YEAR); // Sun (last if start=MON)
const entry_618_prev: IEntry = newTestEntry('06', '18', PREV_YEAR); // Mon (last if start=TUE)
const entry_619_prev: IEntry = newTestEntry('06', '19', PREV_YEAR); // Tues (last if start

const prevTestEntries: IEntry[] = [
  entry_616_prev, entry_617_prev, entry_618_prev, entry_619_prev
]

testEntries = [ ...prevTestEntries, ...testEntries ];

const first = (arr: any[]) => arr[0];
const last = (arr: any[]) => arr[arr.length-1];

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
    describe('with DOW start on SUN', function () {
      it('should filter entries to correct time range', function () {
        SettingsStore.setConfig(
          Object.assign({}, DEFAULT_CONFIG, { startDayOfWeek: 0 })
        );

        let rl = new RollingLayout(testEntries);
        let filteredEntries = rl.filterEntries();

        assert.called(dateNowStub);

        expect(filteredEntries).to.have.length(7);

        expect(filteredEntries).not.to.include(entry_616_prev);
        expect(filteredEntries).to.include.all.members([
          entry_617_prev, entry_618_prev, entry_619_prev,
          entry_619, entry_620, entry_621, entry_622
        ]);
        expect(filteredEntries).not.to.include(entry_623);
        expect(filteredEntries).not.to.include(entry_624);
      })
    });

    describe('with DOW start on MON', function () {
      it('with DOW start on MON', function () {
        SettingsStore.setConfig(
          Object.assign({}, DEFAULT_CONFIG, {startDayOfWeek: 1})
        );

        let rl = new RollingLayout(testEntries);
        let filteredEntries = rl.filterEntries();

        assert.called(dateNowStub);

        expect(filteredEntries).to.have.length(7);

        expect(filteredEntries).not.to.include(entry_616_prev);
        expect(filteredEntries).not.to.include(entry_617_prev);

        expect(filteredEntries).to.include.all.members([
          entry_618_prev, entry_619_prev,
          entry_619, entry_620, entry_621, entry_622, entry_623
        ]);
        expect(filteredEntries).not.to.include(entry_624);
      });
    });
  });

  describe('generateBoxes', function() {
    describe('with DOW start on SUN', function () {
      it('creates a full set of renderable "boxes"', function () {
        SettingsStore.setConfig(DEFAULT_CONFIG);
        let rl = new RollingLayout(testEntries);

        let boxes = rl.generateBoxes();

        expect(boxes).to.have.length(371);

        expect(boxes[0]).to.have.property('date', '2018-06-17');
        expect(boxes[boxes.length - 1]).to.have.property('date', '2019-06-22');
      });
    });

    describe('with DOW start on MON', function () {
      it('creates a full set of renderable "boxes"', function () {
        SettingsStore.setConfig(
          Object.assign({}, DEFAULT_CONFIG, { startDayOfWeek: 1 })
        );

        let rl = new RollingLayout(testEntries);

        let boxes = rl.generateBoxes();

        expect(boxes).to.have.length(371);

        expect(boxes[0]).to.have.property('date', '2018-06-18');
        expect(boxes[boxes.length - 1]).to.have.property('date', '2019-06-23');
      });
    });
  });

  describe('getMonthLabels', function () {
    it('should return 12 month labels in the expected order', function() {
      let rl = new RollingLayout(testEntries);
      let monthLabels = rl.getMonthLabels();

      expect(monthLabels).to.have.length(12);
      expect(monthLabels).to.deep.eq([
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'
      ]);
    });
  });
});
