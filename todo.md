
  ---

  Milestone 3: Dynamic Data & Interactivity

  (Goal: Breathe life into the static components by fetching data, managing state, and handling user events.)


   * [ ] Task: Create API Client Service.
       * In /services/api-client.ts, create functions to fetch trending items, genres, etc. This centralizes data
         fetching logic.
   * [ ] Task: Fetch Data in `App` Component.
       * Use a useEffect hook in App.tsx to call the API client and fetch all necessary data on initial load.
   * [ ] Task: Implement Loading & Error States.
       * Use useState to track isLoading and error states. Display a loading spinner while fetching and a
         user-friendly error message on failure.
   * [ ] Task: Populate `Carousel` with Dynamic Data.
       * Pass the fetched trending items as a prop to the Carousel component and map over them to render
         CarouselItems.
   * [ ] Task: Implement `DetailModal` Component.
       * Create the DetailModal component.
       * Manage its visibility using a selectedItem state in App.tsx.
       * Clicking a CarouselItem will set this state, causing the modal to appear with the correct data.
   * [ ] Task: Implement Dynamic Carousel Scrolling.
       * Use the useRef hook in the Carousel component to get its clientWidth and make the scroll amount fully
         responsive.

  ---

  Milestone 4: Testing & Final Polish

  (Goal: Ensure application quality, clean up loose ends, and establish a testing safety net.)


   * [ ] Task: Configure `.gitignore`.
       * Add build output (/dist), coverage reports, and environment files (.env*) to .gitignore.
   * [ ] Task: Write Unit Test for a Utility.
       * Write a test for a pure function in /services/api-client.ts (e.g., a data transformation function).
   * [ ] Task: Write Component Test for `FaqItem`.
       * In FaqItem.test.tsx, use React Testing Library to verify that the item expands and collapses correctly on
         user click.
   * [ ] Task: Write Integration Test for Modal Flow.
       * Write a test that renders the Carousel, simulates a click on an item, and asserts that the DetailModal
         appears with the expected content.
   * [ ] Task: Code Review and Refactor.
       * Perform a final review of the new codebase for consistency, clarity, and performance.
