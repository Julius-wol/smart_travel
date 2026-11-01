# Customer booking overlaps

`GET /api/bookings/check-availability` and `POST /api/bookings` reject a stay
overlapping the same customer's PENDING, CONFIRMED or CHECKED_IN booking,
including bookings for another room. CANCELLED, REJECTED, COMPLETED and EXPIRED
bookings do not block the customer. The interval is `[checkIn, checkOut)`;
checkout at the next booking's check-in is allowed.

Both endpoints accept the existing bearer token and use its customer ID/email
when supplied. Legacy bookings are also matched by contact email, ignoring case.
The preflight accepts optional `userId` and `email` query parameters for existing
clients without a token. Creation repeats the check before writing a booking.

Overlap response: HTTP 409 with `success: false`, `available: false`,
`conflict: true`, `code: "GUEST_BOOKING_CONFLICT"` and a customer-facing message.
Mobile shows the message and offers a date change without submitting checkout.
An invalid or reversed date range returns HTTP 400.

## Personal booking history

`GET /api/bookings/my-bookings` requires a bearer token. It returns bookings
linked to that account's `userId`, plus legacy bookings without `userId` whose
contact email matches the authenticated account. Supplied email/userId query
parameters cannot change the selected customer. Bookings received on a host's
own rooms and bookings belonging to another account are excluded.
An account with no bookings receives `success: true`, `count: 0`, `data: []`.
Mobile shows an empty state, not sample bookings; focus refreshes the list.
