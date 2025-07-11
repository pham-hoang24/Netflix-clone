import React from "react";
import "./HomePage.css";
import requests from "./requests";
import Row from "./Row";
import Banner from "./Banner";
import Nav from "./Nav";

interface RowData {
  title: string;
  fetchUrl: string;
  isLargeRow?: boolean;
}

const HomePage: React.FC = () => {
  const rowList: RowData[] = [
    {
      title: "NETFLIX ORIGINALS",
      fetchUrl: requests.fetchNetflixOriginals,
      isLargeRow: true,
    },
    {
      title: "Trending Now",
      fetchUrl: requests.fetchTrending,
    },
    { title: "Top Rated", fetchUrl: requests.fetchTopRated },
    { title: "Action Movies", fetchUrl: requests.fetchActionMovies },
    { title: "Comedy Movies", fetchUrl: requests.fetchComedyMovies },
    { title: "Horror Movies", fetchUrl: requests.fetchHorrorMovies },
    { title: "Romance Movies", fetchUrl: requests.fetchRomanceMovies },
    { title: "Documentaries", fetchUrl: requests.fetchDocumentaries },
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