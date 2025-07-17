import React from "react";
import "./HomePage.css";
import requests from "./requests";
import Row from "./Row";
import Banner from "./Banner";
import Nav from "./Nav";
import { useTranslation } from "react-i18next";

interface RowData {
  title: string;
  fetchUrl: string;
  isLargeRow?: boolean;
}

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const rowList: RowData[] = [
    {
      title: t('homePage.netflixOriginals'),
      fetchUrl: requests.fetchNetflixOriginals,
      isLargeRow: true,
    },
    {
      title: t('homePage.trendingNow'),
      fetchUrl: requests.fetchTrending,
    },
    { title: t('homePage.topRated'), fetchUrl: requests.fetchTopRated },
    { title: t('homePage.actionMovies'), fetchUrl: requests.fetchActionMovies },
    { title: t('homePage.comedyMovies'), fetchUrl: requests.fetchComedyMovies },
    { title: t('homePage.horrorMovies'), fetchUrl: requests.fetchHorrorMovies },
    { title: t('homePage.romanceMovies'), fetchUrl: requests.fetchRomanceMovies },
    { title: t('homePage.documentaries'), fetchUrl: requests.fetchDocumentaries },
  ];

  return (
    <div className="homepage">
      <Nav />
      <Banner />
      {rowList.map((row, index) => (
        <Row
          key={index}
          title={row.title}
          fetchUrl={row.fetchUrl}
          isLargeRow={row.isLargeRow}
        />
      ))}
    </div>
  );
};

export default HomePage;
