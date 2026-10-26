// Runs the production mobile HTTP client against a local Postman simulation.
// Only its base URL configuration is substituted. fetch is Node's real fetch.
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

(async () => {
  const apiUrl = process.env.CALENDAR_TEST_API_URL;
  assert.ok(apiUrl, 'Set CALENDAR_TEST_API_URL to the simulation member URL plus /api');
  const config = new vm.SyntheticModule(['API_URL'], function () { this.setExport('API_URL', apiUrl); });
  const client = new vm.SourceTextModule(readFileSync(resolve('mobile-app/src/services/bookingCalendar.js'), 'utf8'));
  await client.link((specifier) => {
    assert.equal(specifier, '../utils/config');
    return config;
  });
  await client.evaluate();
  const { loadBookingCalendar, overlapsBooking, isBookedNight } = client.namespace;
  const ranges = await loadBookingCalendar('664c1234567890abcdef1234');
  assert.deepEqual(ranges, [{ checkIn: '2026-11-12', checkOut: '2026-11-14' }]);
  assert.equal(isBookedNight('2026-11-12', ranges), true);
  assert.equal(isBookedNight('2026-11-14', ranges), false);
  assert.equal(overlapsBooking('2026-11-10', '2026-11-12', ranges), false);
  assert.equal(overlapsBooking('2026-11-11', '2026-11-15', ranges), true);
  assert.deepEqual(await loadBookingCalendar('664c1234567890abcdef1235'), []);
  for (const roomId of ['bad-id', '664c1234567890abcdef1236', '664c1234567890abcdef1237']) {
    await assert.rejects(loadBookingCalendar(roomId));
  }
  console.log('PASS: production client over HTTP, occupied/empty calendar, 400/404/503 and range boundaries.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
