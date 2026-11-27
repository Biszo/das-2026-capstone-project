# Architecture

## Layers
Each layer only talks to the one below it.

```mermaid
flowchart TD
  Browser --> Routes["Routes: read the request, send the response"]
  Routes --> Services["Services: one function per user action"]
  Services --> Rules["Rules: capacity, search, sort, booking states"]
  Services --> Data["Data: where events and bookings are stored"]
```

Where things are today:
- Routes: `src/server.js` (only `/health` and static files so far)
- Services: arrive in Build 4 with the REST API
- Rules: `src/booking-system.js`, `src/event.js`, `src/search.js`, `src/sort.js`, `src/booking-state.js`
- Data: in-memory `Map`s for now, SQLite in Build 5

## Booking life cycle

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> paid: pay
  pending --> cancelled: cancel
  pending --> expired: expire
  paid --> cancelled: cancel
  paid --> checked_in: checkIn
  cancelled --> [*]
  expired --> [*]
  checked_in --> [*]
```

Any action not drawn here is refused with `INVALID_TRANSITION`.