// Production checkout HTTP client against the local Postman simulation.
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

(async () => {
  const apiUrl = process.env.CHECKOUT_TEST_API_URL;
  assert.ok(apiUrl, 'Set CHECKOUT_TEST_API_URL to the simulation member URL plus /api');
  const config = new vm.SyntheticModule(['API_URL'], function () { this.setExport('API_URL', apiUrl); });
  const client = new vm.SourceTextModule(readFileSync('mobile-app/src/services/checkoutBooking.js', 'utf8'));
  await client.link(() => config);
  await client.evaluate();
  const { checkCheckoutAvailability, createCheckoutBooking } = client.namespace;
  const base = {
    roomId: '664c1234567890abcdef1234', userId: '664c1234567890abcdef1235',
    fullName: 'Nguyễn Văn An', phoneNumber: '0901234567', email: 'an@example.com',
    checkIn: '2026-11-10T14:00:00+07:00', checkOut: '2026-11-12T12:00:00+07:00',
    specialNote: '', paymentMethod: 'NAPAS_QR',
  };
  assert.equal((await checkCheckoutAvailability(base)).body.available, true);
  const created = await createCheckoutBooking({ ...base, totalPrice: 3996000 }, 'simulation-token');
  assert.equal(created.status, 201);
  assert.equal(created.body.data.totalPrice, 3700000);
  assert.equal(created.body.data.email, base.email);
  assert.equal((await checkCheckoutAvailability(base)).body.available, false);
  assert.equal((await createCheckoutBooking(base)).status, 409);
  const changed = await createCheckoutBooking({ ...base,
    checkIn: '2026-11-12T14:00:00+07:00', checkOut: '2026-11-15T12:00:00+07:00', specialNote: 'A'.repeat(200),
  });
  assert.equal(changed.body.data.nights, 3);
  assert.equal(changed.body.data.totalPrice, 5550000);
  assert.equal(changed.body.data.specialNote.length, 200);
  assert.equal((await createCheckoutBooking({ ...base, specialNote: 'A'.repeat(201) })).status, 400);
  assert.equal((await checkCheckoutAvailability({ ...base, roomId: '664c1234567890abcdef1236' })).body.available, false);
  const race = { ...base, roomId: '664c1234567890abcdef1237' };
  assert.equal((await checkCheckoutAvailability(race)).body.available, true);
  assert.equal((await createCheckoutBooking(race)).body.code, 'CR_BOOK_09');
  console.log('PASS: production checkout client over real HTTP; created booking, changed dates, note limit, occupied inventory and late conflict.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
