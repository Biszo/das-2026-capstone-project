# Build 1

- **What I asked:** Create a terminal-only ticketing domain core with event tiers, capacity-checked bookings, a linked-list FIFO waitlist, booking lookup by reference, cancellation, a demo, a Map benchmark, and tests using Node's built-in test runner.
- **What came back:** CommonJS modules for events and booking, a linked-list queue, a demo and benchmark, and edge-case tests.
- **What was wrong and what I changed:** Nothing found after checking. I ran npm run demo (it showed the sold-out, refused booking, waitlist, cancellation and next person in line), npm run benchmark (Map was about 76,000x faster than Array.find), and npm test (all tests passed). I also checked that prices are whole kobo and that quantity must be 1 to 10.
- **What I learned:** Map.get is O(1) because it jumps straight to the item using a hash of the key. Array.find is O(n) because it checks items one by one, so it gets slower as the list grows.