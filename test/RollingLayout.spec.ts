import {CalendarData} from "../src/js/CalendarData.js";
import {RollingLayout} from "../src/js/RollingLayout.js";
import {Entry} from "../src/js/Entry.js";

import sinon, {assert, SinonStub} from 'sinon';
import {afterEach} from "mocha";
import {equal} from "assert";
import {expect} from "chai";

const testSettings: CalendarData = {
  rolling: true,
  showCurrentDayBorder: true,
  defaultEntryIntensity: 1,
  intensityScaleStart: 1,
  intensityScaleEnd: 1,
  colors: {
    "test": [ '#111', '#222', '#333' ]
  },
  entries: []
}

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

const entry_619: Entry = {
  date: '2019-06-19',
  intensity: 0,
  color: '#000',
  content: "Jun 19th, 2019"
};

const entry_620: Entry = {
  date: '2019-06-20',
  intensity: 0,
  color: '#000',
  content: "Jun 20th, 2019"
};

const entry_621: Entry = {
  date: '2019-06-21',
  intensity: 0,
  color: '#000',
  content: "Jun 21st, 2019"
};

const entry_622: Entry = {
  date: '2019-06-22',
  intensity: 0,
  color: '#000',
  content: "Jun 22nd, 2019"
};

const entry_623: Entry = {
  date: '2019-06-23',
  intensity: 0,
  color: '#000',
  content: "Jun 23rd, 2019"
};

const entry_624: Entry = {
  date: '2019-06-24',
  intensity: 0,
  color: '#000',
  content: "Jun 24th, 2019"
}

const testEntries: Entry[] = [
  entry_619, entry_620, entry_621, entry_622, entry_623, entry_624
];

testSettings.entries = [ ...testSettings.entries, ...testEntries ];


/*
  And we need entries that occured before the beginning of the RollingLayout time window
 */

const entry_616_prev: Entry = {
  date: '2018-06-16',
  intensity: 0,
  color: '#000',
  content: "Jun 16th, 2018"
}

const entry_617_prev: Entry = {
  date: '2018-06-17',
  intensity: 0,
  color: '#000',
  content: "Jun 17th, 2018"
}

const entry_618_prev: Entry = {
  date: '2018-06-18',
  intensity: 0,
  color: '#000',
  content: "Jun 18th, 2018"
}

const prevTestEntries: Entry[] = [
  entry_616_prev, entry_617_prev, entry_618_prev
]

testSettings.entries = [ ...prevTestEntries, ...testSettings.entries ];

describe('RollingLayout', function () {
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

      let rl = new RollingLayout(testSettings);
      let filteredEntries = rl.filterEntries();

      assert.called(dateNowStub);

      expect(filteredEntries).to.have.length(6);

      expect(filteredEntries).to.contain(entry_617_prev);
      expect(filteredEntries).to.contain(entry_618_prev);
      expect(filteredEntries).to.contain(entry_619);
      expect(filteredEntries).to.contain(entry_620);
      expect(filteredEntries).to.contain(entry_621);
      expect(filteredEntries).to.contain(entry_622);

      expect(filteredEntries).not.to.contain(entry_616_prev);
      expect(filteredEntries).not.to.contain(entry_623);
      expect(filteredEntries).not.to.contain(entry_624);

    })
  })

  describe('generateBoxes', function() {
    it('creates a full set of renderable "boxes"', function () {
      let rl = new RollingLayout(testSettings);

      let boxes = rl.generateBoxes();

      expect(boxes).to.have.length(371);

      expect(boxes[0]).to.have.property('date', '2018-06-17');
      expect(boxes[boxes.length - 1]).to.have.property('date', '2019-06-22');
    })
  })
});
