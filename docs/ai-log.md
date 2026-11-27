# Build 1

- **What I asked:** Create a terminal-only ticketing domain core with event tiers, capacity-checked bookings, a linked-list FIFO waitlist, booking lookup by reference, cancellation, a demo, a Map benchmark, and tests using Node's built-in test runner.
- **What came back:** CommonJS modules for events and booking, a linked-list queue, a demo and benchmark, and edge-case tests.
- **What was wrong and what I changed:** Nothing found after checking. I ran npm run demo (it showed the sold-out, refused booking, waitlist, cancellation and next person in line), npm run benchmark (Map was about 76,000x faster than Array.find), and npm test (all tests passed). I also checked that prices are whole kobo and that quantity must be 1 to 10.
- **What I learned:** Map.get is O(1) because it jumps straight to the item using a hash of the key. Array.find is O(n) because it checks items one by one, so it gets slower as the list grows.



# Build 2

- **What I asked:** I gave the AI my existing event.js, booking-system.js and demo.js and the Build 2 milestone, and asked for search and filter (text, city, date range, price), sorting by date, price and availability using a merge sort I could explain, user stories with acceptance criteria, and tests using Node's built-in test runner.
- **What came back:** An updated createEvent with optional city and date, a search.js with searchEvents, a sort.js with a stable mergeSort and sortEvents, 18 new tests (8 for search and 10 for sorting), and four user stories. I ran npm test (25 tests, all pass, including my 7 from Build 1) and npm run demo (still works).
- **What was wrong and what I changed:** Nothing found after checking. All 25 tests passed and the demo still worked. I did not change the code.
- **What I learned:** The merge sort is stable because when two items are equal, merge takes the left one first (compare(...) <= 0). searchEvents uses filter, which builds a new array, so the original list is never changed. The AI also made a decision I had not specified: the price of an event is the price of its cheapest tier, so I wrote that into the user stories.