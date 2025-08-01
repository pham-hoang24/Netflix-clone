import React from "react";
import { render, act, waitFor, getByTestId, RenderResult, fireEvent } from "@testing-library/react";
import LandingPageContainer from "./LandingPageContainer";
import {
  fetchGenres,
  fetchTrendingWithDetails,
  TrendingItem,
} from "../../services/api-client";
import { faqs } from "../data/faqs";
import LandingPage from "../Landing/LandingPage";

// Mock the API client
jest.mock("../../services/api-client", () => ({
  fetchGenres: jest.fn(),
  fetchTrendingWithDetails: jest.fn(),
}));

// Mock the LandingPage component to inspect props
jest.mock("../Landing/LandingPage", () => {
  // Use `jest.fn` to create a mock that can be inspected
  return jest.fn(({ handleItemClick, handleCloseModal, DetailModal, ...props }) => (
    <div data-testid="landing-page">
      <div data-testid="loading">{props.isLoading.toString()}</div>
      <div data-testid="error">{props.error || "null"}</div>
      <div data-testid="trending-items">{JSON.stringify(props.trendingItems)}</div>
      <div data-testid="genre-map">{JSON.stringify(props.genreMap)}</div>
      <div data-testid="selected-item">{JSON.stringify(props.selectedItem)}</div>
      <div data-testid="faqs">{JSON.stringify(props.faqs)}</div>
      <button 
        data-testid="item-click-trigger" 
        onClick={() => handleItemClick({ id: 1, title: "Test Item" } as TrendingItem)}
      >
        Trigger Item Click
      </button>
      <button 
        data-testid="close-modal-trigger" 
        onClick={handleCloseModal}
      >
        Trigger Close Modal
      </button>
      {/* If the component is a function, we must render it */}
      {props.selectedItem && <DetailModal selectedItem={props.selectedItem} onClose={handleCloseModal} />}
    </div>
  ));
});

// Mock DetailModalContainer
jest.mock("../container/DetailModalContainer", () => {
  return jest.fn(({ selectedItem, onClose }) => (
    <div data-testid="detail-modal">
      Detail Modal for {selectedItem.title}
      <button onClick={onClose}>Close</button>
    </div>
  ));
});

// Mock the i18next library
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock the t function to return the key itself
  }),
}));

const mockFetchGenres = fetchGenres as jest.MockedFunction<typeof fetchGenres>;
const mockFetchTrendingWithDetails = fetchTrendingWithDetails as jest.MockedFunction<typeof fetchTrendingWithDetails>;
const LandingPageMock = LandingPage as jest.Mock; // Type assertion for the mocked component

describe("LandingPageContainer", () => {
  const mockGenreMap = { 1: "Action", 2: "Comedy", 3: "Drama" };
  const mockTrendingItems: TrendingItem[] = [
    {
      id: 1,
      title: "Movie 1",
      overview: "Overview for Movie 1",
      poster_path: "/poster1.jpg",
      backdrop_path: "/backdrop1.jpg",
      popularity: 100,
      genre_ids: [1, 2],
    },
    {
      id: 2,
      title: "Movie 2",
      overview: "Overview for Movie 2",
      poster_path: "/poster2.jpg",
      backdrop_path: "/backdrop2.jpg",
      popularity: 200,
      genre_ids: [2, 3],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchGenres.mockResolvedValue(mockGenreMap);
    mockFetchTrendingWithDetails.mockResolvedValue(mockTrendingItems);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- Initial Data Fetching ---
  describe("Initial Data Fetching", () => {
    it("should call fetchGenres and fetchTrendingWithDetails exactly once on component mount", async () => {
      act(() => {
        render(<LandingPageContainer />);
      });

      expect(mockFetchGenres).toHaveBeenCalledTimes(1);
      expect(mockFetchTrendingWithDetails).toHaveBeenCalledTimes(1);
    });

    it("should update trendingItems and genreMap states on successful API responses", async () => {
      const { getByTestId } = render(<LandingPageContainer />);
      
      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      expect(getByTestId("trending-items")).toHaveTextContent(
        JSON.stringify(mockTrendingItems)
      );
      expect(getByTestId("genre-map")).toHaveTextContent(
        JSON.stringify(mockGenreMap)
      );
    });

    it("should call both API functions concurrently using Promise.all", async () => {
      const genresPromise = Promise.resolve(mockGenreMap);
      const trendingPromise = Promise.resolve(mockTrendingItems);
      
      mockFetchGenres.mockReturnValue(genresPromise);
      mockFetchTrendingWithDetails.mockReturnValue(trendingPromise);

      const { getByTestId } = render(<LandingPageContainer />);

      expect(mockFetchGenres).toHaveBeenCalledTimes(1);
      expect(mockFetchTrendingWithDetails).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });
    });
  });

  // --- Loading State ---
  describe("Loading State", () => {
    it("should have isLoading as true immediately after mount", () => {
      const { getByTestId } = render(<LandingPageContainer />);
      
      expect(getByTestId("loading")).toHaveTextContent("true");
    });

    it("should set isLoading to false after successful API calls", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      expect(getByTestId("loading")).toHaveTextContent("true");

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });
    });

    it("should set isLoading to false after failed API calls", async () => {
      mockFetchGenres.mockRejectedValue(new Error("API Error"));
      mockFetchTrendingWithDetails.mockRejectedValue(new Error("API Error"));

      const { getByTestId } = render(<LandingPageContainer />);

      expect(getByTestId("loading")).toHaveTextContent("true");

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });
    });
  });

  // --- Error Handling ---
  describe("Error Handling", () => {
    it("should set error state with the correct translation key when fetchGenres fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockFetchGenres.mockRejectedValue(new Error("Genres API Error"));

      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("error")).toHaveTextContent("landingPage.failedToLoad");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load initial data:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should set error state with the correct translation key when fetchTrendingWithDetails fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockFetchTrendingWithDetails.mockRejectedValue(new Error("Trending API Error"));

      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("error")).toHaveTextContent("landingPage.failedToLoad");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load initial data:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should set error state with the correct translation key when both API calls fail", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockFetchGenres.mockRejectedValue(new Error("Genres Error"));
      mockFetchTrendingWithDetails.mockRejectedValue(new Error("Trending Error"));

      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("error")).toHaveTextContent("landingPage.failedToLoad");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load initial data:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should not set error state when API calls succeed", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      expect(getByTestId("error")).toHaveTextContent("null");
    });
  });

  // --- State Propagation ---
  describe("State Propagation", () => {
    it("should pass all required props to LandingPage component", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      // Check initial loading state
      expect(getByTestId("loading")).toHaveTextContent("true");
      expect(getByTestId("error")).toHaveTextContent("null");
      expect(getByTestId("trending-items")).toHaveTextContent("[]");
      expect(getByTestId("genre-map")).toHaveTextContent("{}");
      expect(getByTestId("selected-item")).toHaveTextContent("null");
      expect(getByTestId("faqs")).toHaveTextContent(JSON.stringify(faqs));

      // Wait for API calls to complete
      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      // Check final state
      expect(getByTestId("trending-items")).toHaveTextContent(
        JSON.stringify(mockTrendingItems)
      );
      expect(getByTestId("genre-map")).toHaveTextContent(
        JSON.stringify(mockGenreMap)
      );
    });

    it("should pass DetailModalContainer as DetailModal prop", () => {
      render(<LandingPageContainer />);

      expect(LandingPageMock).toHaveBeenCalledWith(
        expect.objectContaining({
          DetailModal: expect.any(Function),
        }),
        undefined 
      );
    });
  });

  // --- handleItemClick Logic ---
  describe("handleItemClick Logic", () => {
    it("should update selectedItem state when handleItemClick is called", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      expect(getByTestId("selected-item")).toHaveTextContent("null");

      fireEvent.click(getByTestId("item-click-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent(
        JSON.stringify({ id: 1, title: "Test Item" })
      );
    });

    it("should handle multiple handleItemClick calls", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      fireEvent.click(getByTestId("item-click-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent(
        JSON.stringify({ id: 1, title: "Test Item" })
      );

      fireEvent.click(getByTestId("item-click-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent(
        JSON.stringify({ id: 1, title: "Test Item" })
      );
    });
  });

  // --- handleCloseModal Logic ---
  describe("handleCloseModal Logic", () => {
    it("should reset selectedItem to null when handleCloseModal is called", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      fireEvent.click(getByTestId("item-click-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent(
        JSON.stringify({ id: 1, title: "Test Item" })
      );

      fireEvent.click(getByTestId("close-modal-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent("null");
    });

    it("should handle handleCloseModal when selectedItem is already null", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      expect(getByTestId("selected-item")).toHaveTextContent("null");

      fireEvent.click(getByTestId("close-modal-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent("null");
    });
  });

  // --- Integration Tests ---
  describe("Integration Tests", () => {
    it("should handle complete user flow: load data, select item, close modal", async () => {
      const { getByTestId } = render(<LandingPageContainer />);

      expect(getByTestId("loading")).toHaveTextContent("true");
      expect(getByTestId("selected-item")).toHaveTextContent("null");

      await waitFor(() => {
        expect(getByTestId("loading")).toHaveTextContent("false");
      });

      expect(getByTestId("trending-items")).toHaveTextContent(
        JSON.stringify(mockTrendingItems)
      );
      expect(getByTestId("genre-map")).toHaveTextContent(
        JSON.stringify(mockGenreMap)
      );

      fireEvent.click(getByTestId("item-click-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent(
        JSON.stringify({ id: 1, title: "Test Item" })
      );

      fireEvent.click(getByTestId("close-modal-trigger"));

      expect(getByTestId("selected-item")).toHaveTextContent("null");
    });

    it("should verify that useEffect dependency array is empty (runs only once)", () => {
      const { rerender } = render(<LandingPageContainer />);

      expect(mockFetchGenres).toHaveBeenCalledTimes(1);
      expect(mockFetchTrendingWithDetails).toHaveBeenCalledTimes(1);

      rerender(<LandingPageContainer />);

      expect(mockFetchGenres).toHaveBeenCalledTimes(1);
      expect(mockFetchTrendingWithDetails).toHaveBeenCalledTimes(1);
    });
  });
});