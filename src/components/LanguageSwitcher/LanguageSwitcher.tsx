import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

function LanguageSwitcher() {
  const { changeLanguage } = useLanguage();

  return (
    <div>
      <button onClick={() => changeLanguage('english')}>English</button>
      <button onClick={() => changeLanguage('suomi')}>Suomi</button>
      <button onClick={() => changeLanguage('tieng viet')}>Tiếng Việt</button>
    </div>
  );
}

export default LanguageSwitcher;
