import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PublicHome() {
  const { t, i18n } = useTranslation();

  // Функція для перемикання мов
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div style={{ padding: 40 }}>
      <header style={{ marginBottom: 20 }}>
        <h1>{t('appTitle')}</h1>
        {/* Кнопки перемикання мови */}
        <button onClick={() => changeLanguage('uk')} disabled={i18n.language === 'uk'}>
          UK
        </button>
        <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'} style={{ marginLeft: 8 }}>
          EN
        </button>
      </header>

      <p>{t('welcomeMessage')}</p>

      <nav style={{ marginBottom: 20 }}>
        <Link to="/matches" style={{ marginRight: 15 }}>{t('matches')}</Link>
        <Link to="/standings" style={{ marginRight: 15 }}>{t('standings')}</Link>
        <Link to="/ranking" style={{ marginRight: 15 }}>{t('ranking')}</Link>
        <Link to="/search">{t('search')}</Link>
      </nav>

      <p>
        {t('managementPrompt')} <Link to="/login">{t('login')}</Link>.
      </p>
    </div>
  );
}