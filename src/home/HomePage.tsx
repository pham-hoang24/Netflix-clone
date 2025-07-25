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

const HomePage: React.FC = () => {
  const [rows, setRows] = useState<RowData[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    logUserEvent('page_view', {
      page_name: 'HomePage',
    });

    const fetchCategories = async () => {
      const categories = await getCategories();
      const rowData = categories.map((category: any) => ({
        id: category.id,
        name: t(`homePage.${category.id}`), // Localized name
        isLargeRow: category.id === 'fetchNetflixOriginals', // Use category.id for comparison
      }));
      setRows(rowData);
    };

    fetchCategories();
  }, [t]); // Add t to dependency array

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