# Booking calendar simulation

## Purpose
Exercise the production mobile calendar HTTP client against the repository-owned
API contract in `server/openapi/booking-calendar.yaml`. The mock was generated
from that spec; its room fixtures are in `../mocks/booking-calendar/default.js`.
No external owner lookup or cloud publication was needed for this new local API.

## Execution
From the repository root, start:
`postman simulation run postman/simulations/booking-calendar.sim.yaml --port 4900 --no-history --output ndjson`

After the listening event, in PowerShell:
`$env:CALENDAR_TEST_API_URL = 'http://localhost:4900/calendar/api'`
`node --experimental-vm-modules scripts/check-booking-calendar.cjs`

Stop the foreground simulation with Ctrl+C. Request logs stay in the terminal;
do not commit logs containing real guest data.

## Assumptions
- 2026-10-25: Node 22 VM modules require the experimental flag for the verification
  script. Only the client's API base URL is substituted; its HTTP fetch and
  range validation run unchanged. This establishes client/contract behavior,
  not persistence correctness.
- 2026-10-25: Controller tests isolate database access. A separate read-only live
  check returned one booked range for a real MongoDB room. No booking or payment
  was created. Native device interaction remains unverified.

## Observations
<!-- begin:observations -->
- 2026-10-25: The calendar member served all five expected requests: occupied and
  empty snapshots (200), invalid room (400), missing room (404), database failure
  (503). Client assertions passed; there were no silent members.
<!-- end:observations -->
