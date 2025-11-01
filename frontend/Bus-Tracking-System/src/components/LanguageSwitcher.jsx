import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng); // Lưu vào localStorage
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${i18n.language === 'vi' ? 'active' : ''}`}
        onClick={() => changeLanguage('vi')}
        title={t('language.vietnamese')}
      >
        <span className="flag">🇻🇳</span>
        <span className="lang-text">VI</span>
      </button>
      <button
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title={t('language.english')}
      >
        <span className="flag">🇬🇧</span>
        <span className="lang-text">EN</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
