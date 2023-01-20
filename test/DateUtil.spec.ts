import {
  datesMatch,
  decrementDate, DOW,
  getDateString,
  getEndOfWeekDate, getNow, getStartOfWeekDate,
  incrementDate,
  padLeft
} from '../src/js/DateUtil.js';

import {ok, equal, notEqual} from 'assert';
import sinon, {assert, SinonStub} from 'sinon';
import {afterEach} from "mocha";


// 12:06 AM (approx Midnight), June 20th 2019
const dateJune20A = new Date(Date.UTC(2019, 5, 20, 0, 6, 0, 0));
// 11:59 PM, June 20th 2019
const dateJune20B = new Date(Date.UTC(2019, 5, 20, 23, 59, 59, 999));
// 12:06 PM, June 21st 2019
const dateJune21 = new Date(Date.UTC(2019, 5, 21, 12, 6, 0, 0));

// For testing around years
// FYI, Date.UTC uses zero-index month, but one-index day
const dateJanuary1 = new Date(Date.UTC(2019, 0, 1, 12, 6, 0, 0))
const dateDecember31 = new Date(Date.UTC(2019, 11, 31, 12, 6, 0, 0))

// For reference:
// https://www.timeanddate.com/calendar/?year=2019&country=1


describe('DateUtil', function () {

  describe('Sinon stub tests', function () {
    let mockToday = new Date(Date.UTC(2019, 5, 20, 12, 6, 0));
    let dateNowStub: SinonStub;

    beforeEach(function () {
      // This feels dirty AF
      dateNowStub = sinon.stub(Date, "now").returns(mockToday.getTime());
    });

    afterEach(function () {
      sinon.restore();
    });

    describe('Sanity test', function () {
      it('should return mocked "today" date when calling Date.now() directly', function() {
        let today = new Date(Date.now());
        equal(today.getUTCFullYear(), 2019);
        equal(today.getUTCMonth(), 5);
        equal(today.getUTCDate(), 20);
        equal(today.getUTCDay(), 4); // Thursday
        equal(today.toISOString(), '2019-06-20T12:06:00.000Z', 'ISO string should be fake date');

        assert.callCount(dateNowStub, 1);
      });
    });

    describe('getNow/timeFloorDate', function() {
      it('should also return the mocked "today" date, floored to T00:00:00', function() {
        let today = getNow();
        equal(today.getUTCFullYear(), 2019);
        equal(today.getUTCMonth(), 5);
        equal(today.getUTCDate(), 20);
        equal(today.getUTCDay(), 4); // Thursday
        equal(today.toISOString(), '2019-06-20T00:00:00.000Z', 'ISO string should be fake date');

        assert.callCount(dateNowStub, 1);
      });
    });
  });

  describe('padLeft', function () {
    it('produces a string to fit a length', function () {
      equal(padLeft('1', 4), '0001');
      equal(padLeft('10', 4), '0010');
      equal(padLeft('100', 4), '0100');
      equal(padLeft('1000', 4), '1000');
    });

    it('coerces number input to string (js does not have leading zero in numbers)', function () {
      equal(padLeft(1, 4), '0001');
      equal(padLeft(10, 4), '0010');
      equal(padLeft(100, 4), '0100');
      equal(padLeft(1000, 4), '1000');
    });

    it('returns input strings over desired length unmodified', function () {
      equal(padLeft('123456', 4), '123456');
    });
  });

  describe('getDateString', function () {
    it('returns same date string regardless of time-of-day', function () {
      equal(getDateString(dateJune20A), '2019-06-20');
      equal(getDateString(dateJune20B), '2019-06-20');
      equal(getDateString(dateJune21), '2019-06-21');
      equal(getDateString(dateJanuary1), '2019-01-01');
      equal(getDateString(dateDecember31), '2019-12-31');
    });
  });

  describe('datesMatch', function () {
    it('compares two date ISO-8601-Date strings', function () {
      ok(datesMatch('2019-06-20', '2019-06-20'));
    });

    it('compares a ISO-8601-Date string and Date object', function () {
      ok(datesMatch('2019-06-20', dateJune20A));
      ok(datesMatch(dateJune20A, '2019-06-20'));
      ok(datesMatch(dateJune20A, dateJune20B));
    });

    it('does not match different dates', function () {
      ok(!datesMatch('2019-06-20', '2019-06-21'));
      ok(!datesMatch(dateJune20A, '2019-06-21'));
      ok(!datesMatch('2019-06-21', dateJune20A));
      ok(!datesMatch(dateJune21, dateJune20A));
    });
  });

  describe('incrementDate', function () {
    it('Adds one day to a date', function () {
      let plusOne = incrementDate(dateJune21);

      equal('2019-06-22', getDateString(plusOne));
      // does not mutate original object
      equal('2019-06-21', getDateString(dateJune21));

      // year rollover
      plusOne = incrementDate(dateDecember31);
      equal(getDateString(plusOne), '2020-01-01', 'Year did not roll forward!');
      equal(getDateString(dateDecember31), '2019-12-31', 'original date object should not mutate!');
    });
  });

  describe('decrementDate', function () {
    it('Subtracts one day to a date', function () {
      let minusOne = decrementDate(dateJune20A);

      equal('2019-06-19', getDateString(minusOne));
      // does not mutate original object
      equal('2019-06-20', getDateString(dateJune20A));

      // year rollover
      minusOne = decrementDate(dateJanuary1);
      equal(getDateString(minusOne), '2018-12-31', 'Year did not roll back!');
      equal(getDateString(dateJanuary1), '2019-01-01', 'original date object should not mutate!');
    });
  });

  describe('getEndOfWeekDate', function () {
    it('should roll date forward to end of the week', function() {
      let endDate;

      endDate = getEndOfWeekDate(dateJune20A);
      equal(getDateString(endDate), '2019-06-22');

      endDate = getEndOfWeekDate(dateJanuary1);
      equal(getDateString(endDate), '2019-01-05');

      endDate = getEndOfWeekDate(dateDecember31);
      equal(getDateString(endDate), '2020-01-04');

      // does not mutate original object
      equal('2019-06-20', getDateString(dateJune20A));
      equal('2019-01-01', getDateString(dateJanuary1));
      equal('2019-12-31', getDateString(dateDecember31));
    });

    it('should roll date forward to a configurable end of the week day', function() {
      let endDate;

      endDate = getEndOfWeekDate(dateJune20A, DOW.SUN);
      equal(getDateString(endDate), '2019-06-23');

      endDate = getEndOfWeekDate(dateJune20A, DOW.MON);
      equal(getDateString(endDate), '2019-06-24');

      endDate = getEndOfWeekDate(dateJune20A, DOW.TUE);
      equal(getDateString(endDate), '2019-06-25');

      endDate = getEndOfWeekDate(dateJune20A, DOW.WED);
      equal(getDateString(endDate), '2019-06-26');

      endDate = getEndOfWeekDate(dateJune20A, DOW.THU);
      equal(getDateString(endDate), '2019-06-20');

      endDate = getEndOfWeekDate(dateJune20A, DOW.FRI);
      equal(getDateString(endDate), '2019-06-21');

      // does not mutate original object
      equal('2019-06-20', getDateString(dateJune20A));
    });
  });

  describe('getStartOfWeekDate', function () {
    it('should roll date backward to the beginning of the week', function() {
      let startDate;

      startDate = getStartOfWeekDate(dateJune20A);
      equal(getDateString(startDate), '2019-06-16');

      startDate = getStartOfWeekDate(dateJanuary1);
      equal(getDateString(startDate), '2018-12-30');

      startDate = getStartOfWeekDate(dateDecember31);
      equal(getDateString(startDate), '2019-12-29');

      // does not mutate original object
      equal('2019-06-20', getDateString(dateJune20A));
      equal('2019-01-01', getDateString(dateJanuary1));
      equal('2019-12-31', getDateString(dateDecember31));
    });

    it('should roll date backward to a configurable beginning day of the week day', function() {
      let startDate;

      startDate = getStartOfWeekDate(dateJune20A, DOW.SUN);
      equal(getDateString(startDate), '2019-06-16');

      startDate = getStartOfWeekDate(dateJune20A, DOW.MON);
      equal(getDateString(startDate), '2019-06-17');

      startDate = getStartOfWeekDate(dateJune20A, DOW.TUE);
      equal(getDateString(startDate), '2019-06-18');

      startDate = getStartOfWeekDate(dateJune20A, DOW.WED);
      equal(getDateString(startDate), '2019-06-19');

      startDate = getStartOfWeekDate(dateJune20A, DOW.THU);
      equal(getDateString(startDate), '2019-06-20');

      startDate = getStartOfWeekDate(dateJune20A, DOW.FRI);
      equal(getDateString(startDate), '2019-06-14');

      startDate = getStartOfWeekDate(dateJune20A, DOW.SAT);
      equal(getDateString(startDate), '2019-06-15');

      // does not mutate original object
      equal('2019-06-20', getDateString(dateJune20A));
    });
  });
});



