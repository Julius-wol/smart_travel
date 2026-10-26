# Checkout simulation

## Purpose
Exercise the production client `mobile-app/src/services/checkoutBooking.js` over
real HTTP against the repository-owned `server/openapi/checkout.yaml` contract.
The local mock is in `../mocks/checkout/default.js`; no external owner search is
needed for this repository's API. Payment is simulated throughout.

## Execution
From the repository root:
`postman simulation run postman/simulations/checkout.sim.yaml --port 4901 --no-history --output ndjson`

After the listening event, in another PowerShell session:
`$env:CHECKOUT_TEST_API_URL = 'http://localhost:4901/checkout/api'`
`node --experimental-vm-modules scripts/check-checkout.cjs`

Stop the simulation with Ctrl+C. Restart before repeating the checks to clear
bookings from the previous run. Do not commit request logs.

## Assumptions
- The mock supplies contract fixtures, not MongoDB persistence or an atomic
  inventory reservation. Backend controller tests isolate persistence; live
  database writes and simultaneous multi-user booking remain unverified.
  (observed 2026-10-26)
- Checkout contact fields remain read-only per the user's latest requirement.
  TC-014 uses an invalid account email; TC-015 must correct the profile and
  reopen Checkout. Direct editing at Checkout is no longer applicable.
  (reasoned 2026-10-26, CheckoutScreen.js)

## Observations
<!-- begin:observations -->
- 2026-10-26: The production client passed against the local simulation. The
  checkout member served availability, creation, note rejection and conflict
  requests, including conflict after a previously available snapshot. No member
  was silent. This proves client HTTP behavior against the stand-in, not live
  database persistence or payment processing.
<!-- end:observations -->
