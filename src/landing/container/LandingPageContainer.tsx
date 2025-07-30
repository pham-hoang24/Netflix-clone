
import React, { useState, useEffect } from "react";
import LandingPage from "../Landing/LandingPage";
import {
  fetchGenres,
  fetchTrendingWithDetails,
  TrendingItem,
} from "../../services/api-client";
import { faqs } from "../data/faqs";

const LandingPageContainer: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<TrendingItem | null>(null);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [genreMap, setGenreMap] = useState<{ [id: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [genres, trending] = await Promise.all([
          fetchGenres(),
          fetchTrendingWithDetails(),
        ]);
        setGenreMap(genres);
        setTrendingItems(trending);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleItemClick = (item: TrendingItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <LandingPage
      isLoading={isLoading}
      error={error}
      trendingItems={trendingItems}
      selectedItem={selectedItem}
      genreMap={genreMap}
      faqs={faqs}
      handleItemClick={handleItemClick}
      handleCloseModal={handleCloseModal}
    />
  );
};

export default LandingPageContainer;
