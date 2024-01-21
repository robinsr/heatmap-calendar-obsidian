import logger, {LogLevel, setLevel} from "../src/util/Log.js";
import {Intensor} from "../src/intensity/Intensor.js";
import {IEntry} from "../src/model/Entry.js";
import {newTestEntry, TEST_YEAR} from "./TestData.js";
import {Api, InstanceSettings, IntensitySettings} from "../src/plugin/api.js";
import SettingsStore from "../src/plugin/SettingsStore.js";
import {expect} from "chai";

setLevel(LogLevel.off)

const log = logger.module('Intensor.spec');

const EMPTY = Symbol.for('empty');

// Represents a series of input intensity values,
// and their corresponding color values (string, hex/whatever)
interface TestResult {
  [ index: number | symbol | string ]: string
}

interface TestCase {
  name: string;
  entries: IEntry[];
  settings: IntensitySettings;
  expects?: (result: TestResult) => void;
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

const DEFAULT_SETTINGS: InstanceSettings = {
  year: new Date().getUTCFullYear(),
  colors: testPalettes,
  entries: [],
  showCurrentDayBorder: true
}

/**
 * Test utility for creating Intensor instance and mapping input Entries
 * Returns results dictionary with two keys per entry:
 *   - [intensity value]: result
 *   - i-[entry index]: result (one-indexed)
 */
const runTest = (settings: IntensitySettings, entries: IEntry[], paletteName: string = "paletteA"): TestResult => {
  SettingsStore.setConfig(Object.assign({}, DEFAULT_SETTINGS, settings));
  SettingsStore.defaultPalette = paletteName;

  let intense = new Intensor(settings, testPalettes, entries);

  let mappedEntries = entries.reduce<TestResult>((p, e, i) => {
    let val: string = intense.mapEntry(e);
    return Object.assign(p, {
      [ e.intensity ? e.intensity : EMPTY ]: val,
      [ `i-${i+1}` ]: val
    });
  }, {});

  log.debug(mappedEntries);

  return mappedEntries;
}


describe('IntensityResolver', function () {

  describe('"Easy" Test Case', function () {
    it('should map regular series to corresponding HEX values', function() {
      let entries = [
        newTestEntry('01', '01', TEST_YEAR, 1),
        newTestEntry('01', '02', TEST_YEAR, 2),
        newTestEntry('01', '03', TEST_YEAR, 3),
        newTestEntry('01', '04', TEST_YEAR, 4),
        newTestEntry('01', '05', TEST_YEAR, 5)
      ];

      let result = runTest({}, entries);

      expect(result[1]).to.eq('#111');
      expect(result[2]).to.eq('#222');
      expect(result[3]).to.eq('#333');
      expect(result[4]).to.eq('#444');
      expect(result[5]).to.eq('#555');
    });
  });

  describe('"Second Palette" Test Case', function () {
    it('should map regular series to secondary HEX values', function() {
      let entries = [
        newTestEntry('01', '01', TEST_YEAR, 1, 'paletteB'),
        newTestEntry('01', '02', TEST_YEAR, 2, 'paletteB'),
        newTestEntry('01', '03', TEST_YEAR, 3, 'paletteB'),
        newTestEntry('01', '04', TEST_YEAR, 4, 'paletteB'),
        newTestEntry('01', '05', TEST_YEAR, 5, 'paletteB')
      ];

      let settings = {
        intensityScaleStart: 1,
        intensityScaleEnd: 5
      }

      let result: TestResult = runTest(settings, entries);

      expect(result[1]).to.eq('#111');
      expect(result[2]).to.eq('#333');
      expect(result[3]).to.eq('#555');
      expect(result[4]).to.eq('#777');
      expect(result[5]).to.eq('#999');
    });
  });

  describe('"Binary" Test Case', function () {
    it('should map entries with positive intensity values to max, and leave others empty', function () {
      let entries = [
        newTestEntry('01', '01', TEST_YEAR, 1),
        newTestEntry('01', '02', TEST_YEAR),
        newTestEntry('01', '03', TEST_YEAR, 17),
        newTestEntry('01', '04', TEST_YEAR),
        newTestEntry('01', '05', TEST_YEAR, -10)
      ];

      let settings = {
        intensityScaleStart: 0,
        intensityScaleEnd: 0
      };

      let result: TestResult = runTest(settings, entries);

      expect(result['i-1']).to.eq('#555');
      expect(result['i-2']).to.eq('#111');
      expect(result['i-3']).to.eq('#555');
      expect(result['i-4']).to.eq('#111');
      expect(result['i-5']).to.eq('#111');
    });
  });

  describe('"Missing intensity values" Test Case', function () {
    it('should use the default value', function () {
      let entries = [
        newTestEntry('01', '01', TEST_YEAR, 1),
        newTestEntry('01', '02', TEST_YEAR, 2),
        newTestEntry('01', '03', TEST_YEAR, 3),
        newTestEntry('01', '04', TEST_YEAR),
        newTestEntry('01', '05', TEST_YEAR, 5)
      ];

      let settings = {
        defaultEntryIntensity: 1
      };

      let result: TestResult = runTest(settings, entries);

      expect(result[1]).to.eq('#111');
      expect(result[2]).to.eq('#222');
      expect(result[3]).to.eq('#333');
      expect(result['i-4']).to.eq('#111');
      expect(result[5]).to.eq('#555');
    });
  });

  describe('"Values out of range" Test Case', function() {
    describe('without scale settings', function() {
      it('should throw off the scale wildly', function() {
        let entries = [
          newTestEntry('01', '01', TEST_YEAR, 1),
          newTestEntry('01', '02', TEST_YEAR, 2),
          newTestEntry('01', '03', TEST_YEAR, -300),
          newTestEntry('01', '04', TEST_YEAR, 4),
          newTestEntry('01', '05', TEST_YEAR, 5),
          newTestEntry('01', '06', TEST_YEAR, 500)
        ];

        let result: TestResult = runTest({}, entries);

        expect(result[1]).to.eq('#333');
        expect(result[2]).to.eq('#333');
        expect(result[-300]).to.eq('#111');
        expect(result[4]).to.eq('#333');
        expect(result[5]).to.eq('#333');
        expect(result[500]).to.eq('#555');
      });
    })

    describe('with scale settings', function () {
      it('should level wildly different values', function() {
        let entries = [
          newTestEntry('01', '01', TEST_YEAR, 1),
          newTestEntry('01', '02', TEST_YEAR, 2),
          newTestEntry('01', '03', TEST_YEAR, -300),
          newTestEntry('01', '04', TEST_YEAR, 4),
          newTestEntry('01', '04', TEST_YEAR, 5),
          newTestEntry('01', '05', TEST_YEAR, 500)
        ];

        let settings = {
          intensityScaleStart: 1,
          intensityScaleEnd: 5
        }

        let result: TestResult = runTest(settings, entries);

        expect(result[1]).to.eq('#111');
        expect(result[2]).to.eq('#222');
        expect(result[-300]).to.eq('#111');
        expect(result[4]).to.eq('#444');
        expect(result[5]).to.eq('#555');
        expect(result[500]).to.eq('#555');
      });
    });
  });

  describe('"Scale start of Zero" Test Case', function () {
    it('should use the default value', function () {
      let entries = [
        newTestEntry('01', '01', TEST_YEAR, 0),
        newTestEntry('01', '02', TEST_YEAR, 1),
        newTestEntry('01', '03', TEST_YEAR, 2),
        newTestEntry('01', '04', TEST_YEAR, 4),
        newTestEntry('01', '04', TEST_YEAR, 5),
        newTestEntry('01', '05', TEST_YEAR, 500)
      ];

      let settings = {
        intensityScaleStart: 0,
        intensityScaleEnd: 5
      }

      let result: TestResult = runTest(settings, entries);

      expect(result['i-1']).to.eq('#111');
      expect(result[1]).to.eq('#222');
      expect(result[2]).to.eq('#333');
      expect(result[4]).to.eq('#555');
      expect(result[5]).to.eq('#555');
      expect(result[500]).to.eq('#555');
    });
  });

  describe('"Narrow range values" Test Case', function () {
    it('should use the default value', function () {
      let entries = [
        newTestEntry('01', '01', TEST_YEAR, 15),
        newTestEntry('01', '02', TEST_YEAR, 16),
        newTestEntry('01', '03', TEST_YEAR, 17),
        newTestEntry('01', '04', TEST_YEAR, 18),
        newTestEntry('01', '05', TEST_YEAR, 99)
      ];

      let settings = {
        intensityScaleStart: 1,
        intensityScaleEnd: 100
      };

      let result: TestResult = runTest(settings, entries);

      expect(result[15]).to.eq('#222');
      expect(result[16]).to.eq('#222');
      expect(result[17]).to.eq('#222');
      expect(result[18]).to.eq('#222');
      expect(result[99]).to.eq('#555');
    })
  });
});
