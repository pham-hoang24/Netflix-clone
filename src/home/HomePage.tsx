import React, { useEffect, useState } from 'react';
import './HomePage.css';
import Row from './Row';
import Banner from './Banner';
import Nav from './Nav';
import { logUserEvent } from '../services/analytics';
import { getCategories } from '../services/movieService';
import { useTranslation } from 'react-i18next';

interface RowData {
  id: string;
  name: string;
  isLargeRow?: boolean;
}

const ROW_ORDER = [
  'fetchNetflixOriginals',
  'fetchTrending',
  'fetchTopRated',
  'fetchActionMovies',
  'fetchComedyMovies',
  'fetchHorrorMovies',
  'fetchRomanceMovies',
  'fetchDocumentaries',
];

const HomePage: React.FC = () => {
  const [rows, setRows] = useState<RowData[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    logUserEvent('page_view', {
      page_name: 'HomePage',
    });

    const fetchCategories = async () => {
      const categories = await getCategories();
      const categoriesMap = new Map(categories.map(cat => [cat.id, cat]));

      const orderedRows: RowData[] = [];
      ROW_ORDER.forEach(categoryId => {
        const category = categoriesMap.get(categoryId);
        if (category) {
          orderedRows.push({
            id: category.id,
            name: t(`homePage.${category.id}`),
            isLargeRow: category.id === 'fetchNetflixOriginals',
          });
        }
      });
      setRows(orderedRows);
    };

    fetchCategories();
  }, [t]);

  return (
    <div className="homepage">
      <Nav />
      <Banner />
      {rows.map((row) => (
        <Row key={row.id} title={row.name} categoryId={row.id} isLargeRow={row.isLargeRow} />
      ))}
    </div>
  );
};
export default HomePage