import React from 'react';
import { useTranslation } from 'react-i18next';

function LandingPageLanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('english')}>English</button>
      <button onClick={() => changeLanguage('suomi')}>Suomi</button>
      <button onClick={() => changeLanguage('tieng viet')}>Tiếng Việt</button>
    </div>
  );
}

export default LandingPageLanguageSwitcher;
