import React from 'react';
import './HomePage.css';
import Row from './container/RowContainer';
import Banner from './container/BannerContainer';
import Nav from './container/NavContainer';
import { useTranslation } from 'react-i18next';

interface RowData {
  id: string;
  name: string;
  isLargeRow?: boolean;
}

interface HomePageProps {
  rows: RowData[];
}

const HomePage: React.FC<HomePageProps> = ({ rows }) => {
  const { t } = useTranslation();

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

export default HomePage;
