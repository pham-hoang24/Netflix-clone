import { Movie } from "../../home/HomePage/types/HomePageTypes";
import React, { useState, useEffect, useRef } from "react";
import LandingPage from "../Landing/LandingPage";
import DetailModalContainer from "../container/DetailModalContainer";
import {
  fetchGenres,
  fetchTrendingWithDetails,
} from "../../services/api-client";
import { faqs } from "../data/faqs";
import { useTranslation } from "react-i18next";

const LandingPageContainer: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Movie | null>(null);
  const [trendingItems, setTrendingItems] = useState<Movie[]>([]);
  const [genreMap, setGenreMap] = useState<{ [id: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
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
          setError(t("landingPage.failedToLoad"));
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
    return () => {
      effectRan.current = true;
    };
  }, []);

  const handleItemClick = (item: Movie) => {
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
      DetailModal={DetailModalContainer}
    />
  );
};

export default LandingPageContainer;
