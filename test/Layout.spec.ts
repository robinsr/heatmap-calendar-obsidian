

import {Layout} from "../src/model/Layout.js";
import {expect} from "chai";
import SettingsStore, {DEFAULT_CONFIG, DEFAULT_SETTINGS} from "../src/plugin/SettingsStore.js";

describe('Layout', function () {
  describe('getDayOfWeekLabels', function () {
    it('should return DOW labels starting with Sunday (0)', function () {
      SettingsStore.setConfig(DEFAULT_CONFIG);

      let layout = new Layout();
      let dow = layout.getDayOfWeekLabels();

      expect(dow).to.have.length(7);
      expect(dow).to.deep.eq([
         'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
      ]);
    });

    it('should return DOW labels starting with configured first DOW', function () {
      SettingsStore.setSettings(
        Object.assign({}, DEFAULT_SETTINGS, { startDayOfWeek: 1 })
      );

      let layout = new Layout();
      let dow = layout.getDayOfWeekLabels();

      expect(dow).to.have.length(7);
      expect(dow).to.deep.eq([
         'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
      ]);
    })
  });
});