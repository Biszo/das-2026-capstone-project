# Build 1

- **What I asked:** Create a terminal-only ticketing domain core with event tiers, capacity-checked bookings, a linked-list FIFO waitlist, booking lookup by reference, cancellation, a demo, a Map benchmark, and tests using Node's built-in test runner.
- **What came back:** CommonJS modules for events and booking, a linked-list queue, a demo and benchmark, and edge-case tests.
- **What was wrong and what I changed:** Nothing found after checking. I ran npm run demo (it showed the sold-out, refused booking, waitlist, cancellation and next person in line), npm run benchmark (Map was about 76,000x faster than Array.find), and npm test (all tests passed). I also checked that prices are whole kobo and that quantity must be 1 to 10.
- **What I learned:** Map.get is O(1) because it jumps straight to the item using a hash of the key. Array.find is O(n) because it checks items one by one, so it gets slower as the list grows.



# Build 2

- **What I asked:** I gave the AI my existing event.js, booking-system.js and demo.js and the Build 2 milestone, and asked for search and filter (text, city, date range, price), sorting by date, price and availability using a merge sort I could explain, user stories with acceptance criteria, and tests using Node's built-in test runner.
- **What came back:** An updated createEvent with optional city and date, a search.js with searchEvents, a sort.js with a stable mergeSort and sortEvents, 18 new tests (8 for search and 10 for sorting), and four user stories. I ran npm test (25 tests, all pass, including my 7 from Build 1) and npm run demo (still works).
- **What was wrong and what I changed:** The AI's descending date sort put events with no date first, which broke my user story that they are listed last. The first test only checked ascending order, so it passed. I found it by running a manual check in the terminal. I fixed sortEvents so undated events are separated and added after the sorted dated events, then added a test for it. All 26 tests pass.
- **What I learned:** The merge sort is stable because when two items are equal, merge takes the left one first (compare(...) <= 0). searchEvents uses filter, which builds a new array, so the original list is never changed. The AI also made a decision I had not specified: the price of an event is the price of its cheapest tier, so I wrote that into the user stories.


# Build 3

- **What I asked:** I gave the AI my existing code and the Build 3 milestone and asked for a booking life cycle written as a state machine (pending, paid, cancelled, expired, checked in), tests that refuse invalid changes such as paying a cancelled booking, a web server using only Node's built-in http module with /health and static files, tests for the server, and an architecture diagram and booking state diagram in docs/.
- **What came back:** booking-state.js with a table of allowed transitions and an InvalidTransitionError, 8 state machine tests, server.js with /health, static file serving and a check that stops requests from reading files outside the public folder, 5 server tests, a public/index.html page, a start script in package.json, and docs/architecture.md with two Mermaid diagrams. npm test now passes NUMBER tests and npm start prints "Server running at http://localhost:3000".
- **What was wrong and what I changed:** I found nothing wrong in the AI's code, but I noticed two things. First, after adding the state machine tests npm test showed 27 passing instead of the 34 I expected. My booking-state.test.js was empty because I pasted it wrongly, and Node counts an empty test file as one passing test, so the total only went up by 1. I confirmed it by searching the file for lines starting with test(, found none, pasted the file again, and then npm test showed 34. Second, the state machine is not connected to booking-system.js yet, which still uses the status 'booked'. I left that for Build 4 when payment is added.
- **What I learned:** A state machine is a table of allowed moves, so anything not in the table is refused, and a cancelled booking has no way forward. If the test total does not go up as expected, a test file is not running properly. The static file server must check that the requested path stays inside the public folder, otherwise someone could request files like package.json.