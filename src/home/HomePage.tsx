import Row from "./container/RowContainer";
import Banner from "./container/BannerContainer";
import Nav from "./container/NavContainer";
import { useTranslation } from "react-i18next";
import YouTube from 'react-youtube';

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

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

interface HomePageProps {
  trailerUrl: string;
  noTrailer: boolean;
  activeRow: string | null;
  onMovieClick: (movie: Movie, categoryId: string) => void;
  onPlayerReady: (event: any) => void;
  onPlayerStateChange: (event: any) => void;
  youtubeOpts: any;
}

const HomePage: React.FC<HomePageProps> = ({ 
  trailerUrl, 
  noTrailer, 
  activeRow,
  onMovieClick, 
  onPlayerReady, 
  onPlayerStateChange,
  youtubeOpts
}) => {
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
          onMovieClick={(movie) => onMovieClick(movie, row.id)} // Pass the handler down
          isPlayerActive={activeRow === row.id}
          trailerUrl={trailerUrl}
          noTrailer={noTrailer}
          youtubeOpts={youtubeOpts}
          onPlayerReady={onPlayerReady}
          onPlayerStateChange={onPlayerStateChange}
        />
      ))}
    </div>
  );
};

export default HomePage;
