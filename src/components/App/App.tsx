import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Hero from '../Hero/Hero';
import ContentSection from '../ContentSection/ContentSection';
import Carousel from '../Carousel/Carousel';
import DetailModal from '../DetailModal/DetailModal';
import FaqSection from '../FaqSection/FaqSection';
import LoginPage from '../LoginPage/LoginPage'; // Import the new LoginPage component
import { fetchGenres, fetchTrendingWithDetails, TrendingItem } from '../../services/api-client';

import './App.module.css';
import styles from './App.module.css';

const App: React.FC = () => {
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
        console.error('Failed to load initial data:', err);
        setError('Failed to load content. Please try again later.');
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

  const faqs = [
    {
      question: 'What is Netflix?',
      answer:
        'Netflix is a streaming service that offers a wide variety of award-winning TV programmes, films, anime, documentaries and more – on thousands of internet-connected devices.<br>You can watch as much as you want, whenever you want, without a single advert – all for one low monthly price. There\'s always something new to discover, and new TV programmes and films are added every week!',
    },
    {
      question: 'How much does Netflix cost?',
      answer:
        'Watch Netflix on your smartphone, tablet, smart TV, laptop or streaming device, all for one fixed monthly fee. Plans range from €9.49 to €17.99 a month. No extra costs, no contracts.',
    },
    {
      question: 'Where can I watch?',
      answer:
        'Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device that offers the Netflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles.<br>You can also download your favourite programmes with the iOS or Android app. Use downloads to watch while you\'re on the go and without an internet connection. Take Netflix with you anywhere.',
    },
    {
      question: 'How do I cancel?',
      answer:
        'Netflix is flexible. There are no annoying contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account at any time.',
    },
    {
      question: 'What can I watch on Netflix?',
      answer:
        'Netflix has an extensive library of feature films, documentaries, series, anime, award-winning Netflix originals, and more. Watch as much as you want, any time you want.',
    },
    {
      question: 'Is Netflix good for children?',
      answer:
        'The Netflix Children\'s experience is included in your membership to give parents control while children enjoy family-friendly TV programmes and films in their own space.<br>Children\'s profiles come with PIN-protected parental controls that let you restrict the maturity rating of content children can watch and block specific titles you don’t want children to see.',
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#f40612', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <Layout>
            <Hero />
            <ContentSection title="Trending Now">
              <Carousel items={trendingItems} onItemClick={handleItemClick} />
            </ContentSection>
            <ContentSection title="More reasons to join">
              {/* Placeholder for cards */}
              <div className={styles.cardContainer}>
                <div className={styles.cards}>
                  <h3>Enjoy on your TV</h3>
                  <p>Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.</p>
                  <div className={styles.svgContainer}>
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><g id="television-core-small"><path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M37.2 53.3992C37.2 52.7365 36.6628 52.1992 36 52.1992H34.8C34.1373 52.1992 33.6 52.7365 33.6 53.3992V56.2636C33.6 56.9129 33.0834 57.4433 32.4347 57.4739C30.3013 57.5744 28.1719 57.7834 26.0546 58.1011L19.444 59.0926C18.2692 59.2688 17.4 60.2782 17.4 61.4662V62.0992C17.4 62.4304 17.6686 62.6992 18 62.6992H52.8C53.1314 62.6992 53.4 62.4304 53.4 62.0992V61.4662C53.4 60.2782 52.5309 59.2688 51.3561 59.0926L44.7454 58.1011C42.6282 57.7834 40.4987 57.5744 38.3653 57.4739C37.7167 57.4433 37.2 56.9129 37.2 56.2636V53.3992Z" fill="url(#paint0_radial_5179_1308)"></path><path id="Vector_2" d="M18.6 60.7388C18.6 60.2306 18.9587 59.796 19.4602 59.711C22.0196 59.2775 29.7585 58.0508 35.4 58.0508C41.0415 58.0508 48.7804 59.2775 51.3398 59.711C51.8412 59.796 52.2 60.2306 52.2 60.7388C52.2 60.902 52.0575 61.0268 51.8967 61.0004C50.1219 60.707 40.9704 59.2409 35.4 59.2409C29.8295 59.2409 20.678 60.707 18.9033 61.0004C18.7425 61.0268 18.6 60.902 18.6 60.7388Z" fill="url(#paint1_radial_5179_1308)"></path><path id="Vector_3" d="M63 12H8.99995C8.00584 12 7.19995 12.8059 7.19995 13.8V51.6C7.19995 52.5941 8.00584 53.4 8.99995 53.4H63C63.9941 53.4 64.8 52.5941 64.8 51.6V13.8C64.8 12.8059 63.9941 12 63 12Z" fill="url(#paint2_linear_5179_1308)"></path><path id="Vector_4" d="M63 12H8.99995C8.00584 12 7.19995 12.8059 7.19995 13.8V51.6C7.19995 52.5941 8.00584 53.4 8.99995 53.4H63C63.9941 53.4 64.8 52.5941 64.8 51.6V13.8C64.8 12.8059 63.9941 12 63 12Z" fill="url(#paint3_radial_5179_1308)"></path><path id="Vector_5" fill-rule="evenodd" clip-rule="evenodd" d="M8.99995 12.6H63C63.663 12.6 64.2 13.1372 64.2 13.8V50.4H7.79995V13.8C7.79995 13.1372 8.33719 12.6 8.99995 12.6ZM7.19995 50.4V13.8C7.19995 12.8059 8.00581 12 8.99995 12H63C63.9942 12 64.8 12.8059 64.8 13.8V50.4V51.6C64.8 52.5941 63.9942 53.4 63 53.4H8.99995C8.00581 53.4 7.19995 52.5941 7.19995 51.6V50.4Z" fill="url(#paint4_radial_5179_1308)"></path><path id="Vector_6" d="M35.4 52.8C36.3941 52.8 37.2 52.3971 37.2 51.9C37.2 51.4029 36.3941 51 35.4 51C34.4059 51 33.6 51.4029 33.6 51.9C33.6 52.3971 34.4059 52.8 35.4 52.8Z" fill="url(#paint5_radial_5179_1308)"></path></g><defs><radialGradient id="paint0_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50.3269 49.3723) rotate(118.526) scale(55.1579 46.2871)"><stop stop-color="#802600"></stop><stop offset="0.333333" stop-color="#6F181D"></stop><stop offset="0.666667" stop-color="#5B1333"></stop><stop offset="1" stop-color="#391945"></stop></radialGradient><radialGradient id="paint1_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(48.1077 53.6128) rotate(158.116) scale(32.7275 42.219)"><stop stop-color="#99421D"></stop><stop offset="0.333333" stop-color="#99161D"></stop><stop offset="0.666667" stop-color="#7D1845"></stop><stop offset="1" stop-color="#59216E"></stop></radialGradient><linearGradient id="paint2_linear_5179_1308" x1="10.4727" y1="14.9572" x2="56.1755" y2="51.4814" gradientUnits="userSpaceOnUse"><stop stop-color="#99161D"></stop><stop offset="0.245283" stop-color="#CA005B"></stop><stop offset="0.346698" stop-color="#FF479A"></stop><stop offset="0.46934" stop-color="#CC3CFF"></stop><stop offset="0.735849" stop-color="#BC1A22"></stop><stop offset="1" stop-color="#C94FF5"></stop></linearGradient><radialGradient id="paint3_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(38.6181 23.8286) rotate(90) scale(25.9571 25.8545)"><stop stop-color="#1C0E20" stop-opacity="0"></stop><stop offset="1" stop-color="#1C0E20"></stop></radialGradient><radialGradient id="paint4_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(54 20.1938) rotate(144.293) scale(47.2897 44.8232)"><stop stop-color="#EF7744"></stop><stop offset="0.333333" stop-color="#E50914"></stop><stop offset="0.666667" stop-color="#A70D53"></stop><stop offset="1" stop-color="#792A95"></stop></radialGradient><radialGradient id="paint5_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36.525 51.3562) rotate(135) scale(4.58735)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FFBDC0"></stop><stop offset="0.666667" stop-color="#F89DC6"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient></defs></svg>
                  </div>
                </div>
                <div className={styles.cards}>
                  <h3>Download your series to watch offline</h3>
                  <p>Save your favourites easily and always have something to watch.</p>
                  <div className={styles.svgContainer}>
                      <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><g id="download-core-small"><path id="Vector" d="M36 70.2008C54.8882 70.2008 70.2001 54.8889 70.2001 36.0008C70.2001 17.1126 54.8882 1.80078 36 1.80078C17.1119 1.80078 1.80005 17.1126 1.80005 36.0008C1.80005 54.8889 17.1119 70.2008 36 70.2008Z" fill="url(#paint0_radial_5179_7940)"></path><path id="Vector_2" opacity="0.4" d="M64.7658 36.195C65.5206 51.5916 53.7908 63.5824 38.5668 62.977C23.3428 62.3722 10.3893 49.4 9.63446 34.0034C8.87954 18.6068 20.6091 6.61594 35.8331 7.22116C51.0571 7.82638 64.0104 20.7984 64.7658 36.195Z" fill="url(#paint1_radial_5179_7940)"></path><path id="Vector_3" d="M62.3657 37.9958C63.1205 53.3924 51.3908 65.3832 36.1668 64.7778C20.9428 64.173 7.9893 51.2008 7.23444 35.8041C6.47952 20.4075 18.2091 8.41672 33.4331 9.02194C48.6571 9.62716 61.6103 22.5992 62.3657 37.9958Z" fill="url(#paint2_radial_5179_7940)"></path><path id="Vector_4" opacity="0.5" d="M64.7658 36.195C65.5206 51.5916 53.7908 63.5824 38.5668 62.977C23.3428 62.3722 10.3893 49.4 9.63446 34.0034C8.87954 18.6068 20.6091 6.61594 35.8331 7.22116C51.0571 7.82638 64.0104 20.7984 64.7658 36.195Z" fill="url(#paint3_radial_5179_7940)"></path><path id="Vector_5" opacity="0.6" d="M36.9 60.6C48.6636 60.6 58.2 51.0637 58.2 39.3C58.2 27.5363 48.6636 18 36.9 18C25.1363 18 15.6 27.5363 15.6 39.3C15.6 51.0637 25.1363 60.6 36.9 60.6Z" fill="url(#paint4_radial_5179_7940)"></path><path id="Vector_6" fill-rule="evenodd" clip-rule="evenodd" d="M39.0849 42.2727L46.3387 35.76L48.8945 38.5142L38.9118 47.477L37.8466 48.4333L36.6071 47.477L24.9899 38.5142L27.0434 35.76L35.4849 42.2727L33.6 21.6016H37.2L39.0849 42.2727Z" fill="url(#paint5_radial_5179_7940)"></path><path id="Vector_7" opacity="0.4" fill-rule="evenodd" clip-rule="evenodd" d="M61.6566 34.9618C61.7832 35.3893 62.391 35.3233 62.3694 34.878C61.6962 21.1369 50.1509 9.55975 36.5817 9.01957C34.4606 8.93515 32.4155 9.12541 30.4772 9.55909C30.0745 9.64915 30.1575 10.2082 30.5697 10.2246C45.0094 10.7979 57.6246 21.2971 61.6566 34.9618Z" fill="url(#paint6_radial_5179_7940)"></path></g><defs><radialGradient id="paint0_radial_5179_7940" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36.0001 36.1837) rotate(-90) scale(34.3829)"><stop offset="0.782019" stop-color="#982DBE"></stop><stop offset="0.906819" stop-color="#B038DC" stop-opacity="0.2"></stop><stop offset="1" stop-color="#E4A1FA" stop-opacity="0"></stop></radialGradient><radialGradient id="paint1_radial_5179_7940" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(52.9937 20.0992) rotate(135) scale(49.9836)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FFBDC0"></stop><stop offset="0.666667" stop-color="#F89DC6"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient><radialGradient id="paint2_radial_5179_7940" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(52.7999 19.6937) rotate(135) scale(53.1037)"><stop stop-color="#FFA984"></stop><stop offset="0.333333" stop-color="#FF787F"></stop><stop offset="0.666667" stop-color="#F45FA2"></stop><stop offset="1" stop-color="#C44AF1"></stop></radialGradient><radialGradient id="paint3_radial_5179_7940" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(52.9937 20.0992) rotate(135) scale(49.9836)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FFBDC0"></stop><stop offset="0.666667" stop-color="#F89DC6"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient><radialGradient id="paint4_radial_5179_7940" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36.9 39.3) scale(21.3)"><stop stop-color="white"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></radialGradient><radialGradient id="paint5_radial_5179_7940" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(31.2 32.1016) rotate(39.5226) scale(15.5567)"><stop stop-color="#EF7744"></stop><stop offset="0.2406" stop-color="#E50914"></stop><stop offset="1" stop-color="#792A95"></stop></radialGradient><radialGradient id="paint6_radial_5179_7940" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50.7 21.3) rotate(-180) scale(30)"><stop stop-color="white"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></radialGradient></defs></svg>
                  </div>
                </div>
                <div className={styles.cards}>
                  <h3>Watch everywhere</h3>
                  <p>Stream unlimited films and series on your phone, tablet, laptop and TV.</p>
                  <div className={styles.svgContainer}>
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><g id="television-core-small"><path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M37.2 53.3992C37.2 52.7365 36.6628 52.1992 36 52.1992H34.8C34.1373 52.1992 33.6 52.7365 33.6 53.3992V56.2636C33.6 56.9129 33.0834 57.4433 32.4347 57.4739C30.3013 57.5744 28.1719 57.7834 26.0546 58.1011L19.444 59.0926C18.2692 59.2688 17.4 60.2782 17.4 61.4662V62.0992C17.4 62.4304 17.6686 62.6992 18 62.6992H52.8C53.1314 62.6992 53.4 62.4304 53.4 62.0992V61.4662C53.4 60.2782 52.5309 59.2688 51.3561 59.0926L44.7454 58.1011C42.6282 57.7834 40.4987 57.5744 38.3653 57.4739C37.7167 57.4433 37.2 56.9129 37.2 56.2636V53.3992Z" fill="url(#paint0_radial_5179_1308)"></path><path id="Vector_2" d="M18.6 60.7388C18.6 60.2306 18.9587 59.796 19.4602 59.711C22.0196 59.2775 29.7585 58.0508 35.4 58.0508C41.0415 58.0508 48.7804 59.2775 51.3398 59.711C51.8412 59.796 52.2 60.2306 52.2 60.7388C52.2 60.902 52.0575 61.0268 51.8967 61.0004C50.1219 60.707 40.9704 59.2409 35.4 59.2409C29.8295 59.2409 20.678 60.707 18.9033 61.0004C18.7425 61.0268 18.6 60.902 18.6 60.7388Z" fill="url(#paint1_radial_5179_1308)"></path><path id="Vector_3" d="M63 12H8.99995C8.00584 12 7.19995 12.8059 7.19995 13.8V51.6C7.19995 52.5941 8.00584 53.4 8.99995 53.4H63C63.9941 53.4 64.8 52.5941 64.8 51.6V13.8C64.8 12.8059 63.9941 12 63 12Z" fill="url(#paint2_linear_5179_1308)"></path><path id="Vector_4" d="M63 12H8.99995C8.00584 12 7.19995 12.8059 7.19995 13.8V51.6C7.19995 52.5941 8.00584 53.4 8.99995 53.4H63C63.9941 53.4 64.8 52.5941 64.8 51.6V13.8C64.8 12.8059 63.9941 12 63 12Z" fill="url(#paint3_radial_5179_1308)"></path><path id="Vector_5" fill-rule="evenodd" clip-rule="evenodd" d="M8.99995 12.6H63C63.663 12.6 64.2 13.1372 64.2 13.8V50.4H7.79995V13.8C7.79995 13.1372 8.33719 12.6 8.99995 12.6ZM7.19995 50.4V13.8C7.19995 12.8059 8.00581 12 8.99995 12H63C63.9942 12 64.8 12.8059 64.8 13.8V50.4V51.6C64.8 52.5941 63.9942 53.4 63 53.4H8.99995C8.00581 53.4 7.19995 52.5941 7.19995 51.6V50.4Z" fill="url(#paint4_radial_5179_1308)"></path><path id="Vector_6" d="M35.4 52.8C36.3941 52.8 37.2 52.3971 37.2 51.9C37.2 51.4029 36.3941 51 35.4 51C34.4059 51 33.6 51.4029 33.6 51.9C33.6 52.3971 34.4059 52.8 35.4 52.8Z" fill="url(#paint5_radial_5179_1308)"></path></g><defs><radialGradient id="paint0_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50.3269 49.3723) rotate(118.526) scale(55.1579 46.2871)"><stop stop-color="#802600"></stop><stop offset="0.333333" stop-color="#6F181D"></stop><stop offset="0.666667" stop-color="#5B1333"></stop><stop offset="1" stop-color="#391945"></stop></radialGradient><radialGradient id="paint1_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(48.1077 53.6128) rotate(158.116) scale(32.7275 42.219)"><stop stop-color="#99421D"></stop><stop offset="0.333333" stop-color="#99161D"></stop><stop offset="0.666667" stop-color="#7D1845"></stop><stop offset="1" stop-color="#59216E"></stop></radialGradient><linearGradient id="paint2_linear_5179_1308" x1="10.4727" y1="14.9572" x2="56.1755" y2="51.4814" gradientUnits="userSpaceOnUse"><stop stop-color="#99161D"></stop><stop offset="0.245283" stop-color="#CA005B"></stop><stop offset="0.346698" stop-color="#FF479A"></stop><stop offset="0.46934" stop-color="#CC3CFF"></stop><stop offset="0.735849" stop-color="#BC1A22"></stop><stop offset="1" stop-color="#C94FF5"></stop></linearGradient><radialGradient id="paint3_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(38.6181 23.8286) rotate(90) scale(25.9571 25.8545)"><stop stop-color="#1C0E20" stop-opacity="0"></stop><stop offset="1" stop-color="#1C0E20"></stop></radialGradient><radialGradient id="paint4_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(54 20.1938) rotate(144.293) scale(47.2897 44.8232)"><stop stop-color="#EF7744"></stop><stop offset="0.333333" stop-color="#E50914"></stop><stop offset="0.666667" stop-color="#A70D53"></stop><stop offset="1" stop-color="#792A95"></stop></radialGradient><radialGradient id="paint5_radial_5179_1308" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36.525 51.3562) rotate(135) scale(4.58735)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FFBDC0"></stop><stop offset="0.666667" stop-color="#F89DC6"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient></defs></svg>
                  </div>
                </div>
                <div className={styles.cards}>
                  <h3>Create profiles for children</h3>
                  <p>Send children on adventures with their favourite characters in a space made just for them — free with your membership.</p>
                  <div className={styles.svgContainer}>
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><g id="profiles-core-small"><path id="Vector" d="M10.8 15.6008C10.8 12.9499 12.949 10.8008 15.5999 10.8008H40.8C43.4509 10.8008 45.6 12.9498 45.6 15.6008V40.8007C45.6 43.4516 43.4509 45.6007 40.8 45.6007H15.6C12.949 45.6007 10.8 43.4517 10.8 40.8007V15.6008Z" fill="url(#paint0_radial_5179_7919)"></path><path id="Vector_2" d="M9.59998 14.4016C9.59998 11.7506 11.749 9.60162 14.4 9.60156H39.6C42.251 9.60156 44.4 11.7506 44.4 14.4016V39.6015C44.4 42.2525 42.251 44.4015 39.6 44.4015H14.4C11.749 44.4016 9.59998 42.2525 9.59998 39.6015V14.4016Z" fill="url(#paint1_radial_5179_7919)"></path><path id="Vector_3" d="M18.6 21.9008C18.6 23.0606 17.6598 24.0008 16.5 24.0008C15.3402 24.0008 14.4 23.0606 14.4 21.9008C14.4 20.741 15.3402 19.8008 16.5 19.8008C17.6598 19.8008 18.6 20.741 18.6 21.9008Z" fill="url(#paint2_radial_5179_7919)"></path><path id="Vector_4" d="M39.6 21.9008C39.6 23.0606 38.6598 24.0008 37.5 24.0008C36.3402 24.0008 35.4 23.0606 35.4 21.9008C35.4 20.741 36.3402 19.8008 37.5 19.8008C38.6598 19.8008 39.6 20.741 39.6 21.9008Z" fill="url(#paint3_radial_5179_7919)"></path><path id="Vector_5" d="M23.6713 29.4501C23.2437 29.1967 22.6917 29.3379 22.4383 29.7655C22.1848 30.1932 22.3261 30.7452 22.7537 30.9986C23.8254 31.6337 26.769 32.7744 30.6375 32.7744C34.506 32.7744 37.4497 31.6337 38.5213 30.9986C38.949 30.7452 39.0902 30.1932 38.8368 29.7655C38.5834 29.3379 38.0313 29.1967 37.6037 29.4501C36.8191 29.9151 34.194 30.9744 30.6375 30.9744C27.081 30.9744 24.456 29.9151 23.6713 29.4501Z" fill="url(#paint4_radial_5179_7919)"></path><path id="Vector_6" opacity="0.35" d="M19.2 44.4016H28.2L32.4 27.6016C30.2787 28.1801 28.4542 29.5387 27.2921 31.4053L19.2 44.4016Z" fill="url(#paint5_radial_5179_7919)"></path><path id="Vector_7" d="M27.6 32.4016C27.6 29.7506 29.749 27.6016 32.4 27.6016L57.6 27.6016C60.2508 27.6016 62.4 29.7506 62.4 32.4016V57.6015C62.4 60.2524 60.2508 62.4016 57.6 62.4016H32.4C29.749 62.4016 27.6 60.2524 27.6 57.6016V32.4016Z" fill="url(#paint6_radial_5179_7919)"></path><path id="Vector_8" d="M36.6 39.9008C36.6 41.0606 35.6598 42.0008 34.5 42.0008C33.3402 42.0008 32.4 41.0606 32.4 39.9008C32.4 38.741 33.3402 37.8008 34.5 37.8008C35.6598 37.8008 36.6 38.741 36.6 39.9008Z" fill="url(#paint7_radial_5179_7919)"></path><path id="Vector_9" d="M57.6 39.9008C57.6 41.0606 56.6598 42.0008 55.5 42.0008C54.3402 42.0008 53.4 41.0606 53.4 39.9008C53.4 38.741 54.3402 37.8008 55.5 37.8008C56.6598 37.8008 57.6 38.741 57.6 39.9008Z" fill="url(#paint8_radial_5179_7919)"></path><path id="Vector_10" d="M41.8213 47.6025C41.3937 47.349 40.8416 47.4903 40.5882 47.9179C40.3348 48.3455 40.476 48.8976 40.9037 49.1509C41.9753 49.786 44.919 50.9267 48.7875 50.9267C52.656 50.9267 55.5996 49.786 56.6713 49.1509C57.0989 48.8976 57.2402 48.3455 56.9867 47.9179C56.7333 47.4903 56.1813 47.349 55.7537 47.6025C54.969 48.0674 52.344 49.1267 48.7875 49.1267C45.231 49.1267 42.6059 48.0674 41.8213 47.6025Z" fill="url(#paint9_radial_5179_7919)"></path></g><defs><radialGradient id="paint0_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(39.075 17.6882) rotate(135) scale(32.8097)"><stop stop-color="#99421D"></stop><stop offset="0.333333" stop-color="#99161D"></stop><stop offset="0.666667" stop-color="#7D1845"></stop><stop offset="1" stop-color="#59216E"></stop></radialGradient><radialGradient id="paint1_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(62.4 8.70157) rotate(133.87) scale(75.3216)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FFBDC0"></stop><stop offset="0.666667" stop-color="#F89DC6"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient><radialGradient id="paint2_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60.3 11.1008) rotate(133.939) scale(68.7426 55.9547)"><stop stop-color="#99421D"></stop><stop offset="0.333333" stop-color="#99161D"></stop><stop offset="0.666667" stop-color="#7D1845"></stop><stop offset="1" stop-color="#59216E"></stop></radialGradient><radialGradient id="paint3_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60.3 11.1008) rotate(133.939) scale(68.7426 55.9547)"><stop stop-color="#99421D"></stop><stop offset="0.333333" stop-color="#99161D"></stop><stop offset="0.666667" stop-color="#7D1845"></stop><stop offset="1" stop-color="#59216E"></stop></radialGradient><radialGradient id="paint4_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60.3 11.0994) rotate(133.939) scale(68.7426 55.9548)"><stop stop-color="#99421D"></stop><stop offset="0.333333" stop-color="#99161D"></stop><stop offset="0.666667" stop-color="#7D1845"></stop><stop offset="1" stop-color="#59216E"></stop></radialGradient><radialGradient id="paint5_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(39.6 27.9016) rotate(135) scale(23.3345)"><stop stop-color="#FFA984"></stop><stop offset="0.333333" stop-color="#FF787F"></stop><stop offset="0.666667" stop-color="#F45FA2"></stop><stop offset="1" stop-color="#C44AF1"></stop></radialGradient><radialGradient id="paint6_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(61.8 29.7016) rotate(135) scale(43.2749)"><stop stop-color="#EF7744"></stop><stop offset="0.333333" stop-color="#E50914"></stop><stop offset="0.666667" stop-color="#A70D53"></stop><stop offset="1" stop-color="#792A95"></stop></radialGradient><radialGradient id="paint7_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(62.1 11.1008) rotate(137.146) scale(73.6614 60.3576)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FDF6F6"></stop><stop offset="0.666667" stop-color="#FADCE9"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient><radialGradient id="paint8_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(62.1 11.1008) rotate(137.146) scale(73.6614 60.3576)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FDF6F6"></stop><stop offset="0.666667" stop-color="#FADCE9"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient><radialGradient id="paint9_radial_5179_7919" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(62.1 11.1017) rotate(137.146) scale(73.6614 60.3576)"><stop stop-color="#FFDCCC"></stop><stop offset="0.333333" stop-color="#FDF6F6"></stop><stop offset="0.666667" stop-color="#FADCE9"></stop><stop offset="1" stop-color="#E4A1FA"></stop></radialGradient></defs></svg>
                  </div>
                </div>
              </div>
            </ContentSection>
            <ContentSection title="Frequently Asked Questions">
              <FaqSection faqs={faqs} />
            </ContentSection>

            {selectedItem && (
              <DetailModal item={selectedItem} onClose={handleCloseModal} genreMap={genreMap} />
            )}
          </Layout>
        } />
      </Routes>

  );
};

export default App;
