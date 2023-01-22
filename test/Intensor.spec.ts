import {clamp, makeLinearFunc, Intensor} from "../src/js/Intensor.js";
import {IEntry} from "../src/js/Entry.js";
import {newTestEntry, TEST_YEAR} from "./TestData.js";
import {CalendarData, IntensitySettings} from "../src/js/CalendarData.js";
import SettingsStore from "../src/js/SettingsStore.js";
import {expect} from "chai";

const EMPTY = Symbol.for('empty');

// Represents an series of input intensity values,
// and their corresponding color values (string, hex/whatever)
interface TestResult {
  [index: number | symbol]: string
}

interface TestCase {
  name: string;
  entries: IEntry[];
  settings: IntensitySettings;
  expects: (result: TestResult) => void;
}


/*
  The doc suggests some test cases:

  The "Intensity" means which intensity of color to use, for example from light-green to dark-green,
  and they will be distributed between the highest and lowest number you pass to "intensity".
  If the number range 0-100 is used, numbers between 1-20 would map to the lightest color, 40-60 would
  map to mid intensity color, and 80-100 would map to max intensity. You can add more intensities in
  order to increase color resolution; simply supply more colors to calendarData.colors.yourcolor
 */


const testPalettes = {
  paletteA: [ '#111', '#222', '#333', '#444', '#555' ],
  paletteB: [ '#111', '#222', '#333', '#444', '#555', '#666', '#777', '#888', '#999', '#aaa' ]
}

const TEST_CASES: { [key: string]: TestCase } = {
  EASY: {
    name: "More-or-less the default",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 1),
      newTestEntry('01', '02', TEST_YEAR, 2),
      newTestEntry('01', '03', TEST_YEAR, 3),
      newTestEntry('01', '04', TEST_YEAR, 4),
      newTestEntry('01', '05', TEST_YEAR, 5)
    ],
    settings: {},
    expects: (result: TestResult) => {
      expect(result[1]).to.eq('#111')
      expect(result[2]).to.eq('#222')
      expect(result[3]).to.eq('#333')
      expect(result[4]).to.eq('#444')
      expect(result[5]).to.eq('#555')
    }
  },
  EASY_ALT_COLORS: {
    name: "Same data, different color",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 1, 'paletteB'),
      newTestEntry('01', '02', TEST_YEAR, 2, 'paletteB'),
      newTestEntry('01', '03', TEST_YEAR, 3, 'paletteB'),
      newTestEntry('01', '04', TEST_YEAR, 4, 'paletteB'),
      newTestEntry('01', '05', TEST_YEAR, 5, 'paletteB')
    ],
    settings: {
      intensityScaleStart: 1,
      intensityScaleEnd: 5
    },
    expects: (result: TestResult) => {
      expect(result[1]).to.eq('#111')
      expect(result[2]).to.eq('#333')
      expect(result[3]).to.eq('#555')
      expect(result[4]).to.eq('#777')
      expect(result[5]).to.eq('#999')
    }
  },
  BINARY: {
    name: "easy",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 1, 'paletteB'),
      newTestEntry('01', '02', TEST_YEAR, 2, 'paletteB'),
      newTestEntry('01', '03', TEST_YEAR, 3, 'paletteB'),
      newTestEntry('01', '04', TEST_YEAR, 4, 'paletteB'),
      newTestEntry('01', '05', TEST_YEAR, 5, 'paletteB')
    ],
    settings: {
      intensityScaleStart: 1,
      intensityScaleEnd: 5
    },
    expects: (result: TestResult) => {
      expect(result[1]).to.eq('#111')
      expect(result[2]).to.eq('#333')
      expect(result[3]).to.eq('#555')
      expect(result[4]).to.eq('#777')
      expect(result[5]).to.eq('#999')
    }
  },
  NO_INTENSITY_VAL: {
    name: "An entry is without a value for intensity",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 1),
      newTestEntry('01', '02', TEST_YEAR, 2),
      newTestEntry('01', '03', TEST_YEAR, 3),
      newTestEntry('01', '04', TEST_YEAR),
      newTestEntry('01', '05', TEST_YEAR, 5)
    ],
    settings: {
      defaultEntryIntensity: 1
    },
    expects: (result: TestResult) => {
      expect(result[1]).to.eq('#111')
      expect(result[2]).to.eq('#222')
      expect(result[3]).to.eq('#333')
      expect(result[EMPTY]).to.eq('#111')
      expect(result[5]).to.eq('#555')
    }
  },
  OUT_OF_RANGE_NO_SCALE: {
    name: "Intensities out of range",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 1),
      newTestEntry('01', '02', TEST_YEAR, 2),
      newTestEntry('01', '03', TEST_YEAR, -1500),
      newTestEntry('01', '04', TEST_YEAR, 4),
      newTestEntry('01', '04', TEST_YEAR, 5),
      newTestEntry('01', '05', TEST_YEAR, 500)
    ],
    settings: {},
    expects: (result: TestResult) => {
      expect(result[1]).to.eq('#555')
      expect(result[2]).to.eq('#555')
      expect(result[4]).to.eq('#555')
      expect(result[5]).to.eq('#555')
      expect(result[500]).to.eq('#555')
      expect(result[-1500]).to.eq('#111')
    }
  },
  OUT_OF_RANGE_WITH_SCALE: {
    name: "Intensities out of range",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 1),
      newTestEntry('01', '02', TEST_YEAR, 2),
      newTestEntry('01', '03', TEST_YEAR, -1500),
      newTestEntry('01', '04', TEST_YEAR, 4),
      newTestEntry('01', '04', TEST_YEAR, 5),
      newTestEntry('01', '05', TEST_YEAR, 500)
    ],
    settings: {
      intensityScaleStart: 1,
      intensityScaleEnd: 5
    },
    expects: (result: TestResult) => {
      expect(result[1]).to.eq('#111')
      expect(result[2]).to.eq('#222')
      expect(result[4]).to.eq('#444')
      expect(result[5]).to.eq('#555')
      expect(result[500]).to.eq('#555')
      expect(result[-1500]).to.eq('#111')
    }
  },
  SCALE_START_OF_ZERO: {
    name: "User sets intensityScaleStart to 0 (a falsy value)",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 0),
      newTestEntry('01', '02', TEST_YEAR, 1),
      newTestEntry('01', '03', TEST_YEAR, 2),
      newTestEntry('01', '04', TEST_YEAR, 4),
      newTestEntry('01', '04', TEST_YEAR, 5),
      newTestEntry('01', '05', TEST_YEAR, 500)
    ],
    settings: {
      intensityScaleStart: 0,
      intensityScaleEnd: 5
    },
    expects: (result: TestResult) => {
      expect(result[EMPTY]).to.eq('#111')
      expect(result[1]).to.eq('#222')
      expect(result[2]).to.eq('#333')
      expect(result[4]).to.eq('#555')
      expect(result[5]).to.eq('#555')
      expect(result[500]).to.eq('#555')
    }
  },
  NARROW: {
    name: "Intensities in narrow range",
    entries: [
      newTestEntry('01', '01', TEST_YEAR, 15),
      newTestEntry('01', '02', TEST_YEAR, 16),
      newTestEntry('01', '03', TEST_YEAR, 17),
      newTestEntry('01', '04', TEST_YEAR, 18),
      newTestEntry('01', '05', TEST_YEAR, 99)
    ],
    settings: {
      intensityScaleStart: 1,
      intensityScaleEnd: 100
    },
    expects: (result: TestResult) => {
      expect(result[15]).to.eq('#222')
      expect(result[16]).to.eq('#222')
      expect(result[17]).to.eq('#222')
      expect(result[18]).to.eq('#222')
      expect(result[99]).to.eq('#555')
    }
  }
}


const DEFAULT_SETTINGS: CalendarData = {
  year: new Date().getUTCFullYear(),
  colors: testPalettes,
  entries: [],
  showCurrentDayBorder: true,
}


const runTest = (testCase: TestCase) => {
  let { entries, settings, expects } = testCase;

  SettingsStore.set(Object.assign({}, DEFAULT_SETTINGS, settings));
  SettingsStore.defaultPalette = "paletteA"

  let intense = new Intensor(settings, testPalettes, entries);

  let mappedEntries = entries.reduce<TestResult>((p, e) => {
    let key = e.intensity ? e.intensity : EMPTY;
    return Object.assign(p, { [key]: intense.mapEntry(e) });
  }, {});

  expects(mappedEntries);
}


describe('IntensityResolver', function () {

  describe('"EASY" Test Case', function () {
    it('should be ok', function() {
      runTest(TEST_CASES.EASY)
    });
  });

  describe('"EASY_ALT_COLORS" Test Case', function () {
    it('should be ok', function() {
      runTest(TEST_CASES.EASY_ALT_COLORS)
    });
  });

  describe('"NO_INTENSITY_VAL" Test Case', function () {
    it('should use the default value', function () {
      runTest(TEST_CASES.NO_INTENSITY_VAL)
    })
  });

  describe('"OUT_OF_RANGE" Test Case', function() {
    describe('without scale settings', function() {
      it('should throw off the scale wildly', function() {
        runTest(TEST_CASES.OUT_OF_RANGE_NO_SCALE)
      });
    })

    describe('with scale settings', function () {
      it('should level wildly different values', function() {
        runTest(TEST_CASES.OUT_OF_RANGE_WITH_SCALE)
      });
    });
  });

  describe('"SCALE_START_OF_ZERO" Test Case', function () {
    it('should use the default value', function () {
      runTest(TEST_CASES.SCALE_START_OF_ZERO)
    })
  });

  describe('"NARROW" Test Case', function () {
    it('should use the default value', function () {
      runTest(TEST_CASES.NARROW)
    })
  });
});
