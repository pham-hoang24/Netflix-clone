import Row from "./container/RowContainer";
import Banner from "./container/BannerContainer";
import Nav from "./container/NavContainer";
import { useTranslation } from "react-i18next";

const rows = [
  { id: "fetchNetflixOriginals", isLargeRow: true },
  { id: "fetchTrending" },
  { id: "fetchTopRated" },
  { id: "fetchActionMovies" },
  { id: "fetchComedyMovies" },
  { id: "fetchHorrorMovies" },
  { id: "fetchRomanceMovies" },
  { id: "fetchDocumentaries" },
];

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="homepage">
      <Nav />
      <Banner />
      {rows.map((row) => (
        <Row
          key={row.id}
          title={t(`homePage.${row.id}`)}
          categoryId={row.id}
          isLargeRow={row.isLargeRow}
        />
      ))}
    </div>
  );
};

export default HomePage;
