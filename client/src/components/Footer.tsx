
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-football-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚽</span>
              </div>
              <span className="text-xl font-bold">OpenFootball</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {i18n.language === 'ua' 
                ? 'Професійна система управління футбольними турнірами та змаганнями. Організовуйте, керуйте та слідкуйте за вашими футбольними подіями.'
                : 'Professional football tournament management system. Organize, manage and track your football events.'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-football-green">{t('about')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tournaments" className="text-gray-400 hover:text-football-green transition-colors text-sm">
                  {t('tournaments')}
                </Link>
              </li>
              <li>
                <Link to="/teams" className="text-gray-400 hover:text-football-green transition-colors text-sm">
                  {t('teams')}
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-gray-400 hover:text-football-green transition-colors text-sm">
                  {t('matches')}
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="text-gray-400 hover:text-football-green transition-colors text-sm">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Streams */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-football-green">{t('socialMedia')}</h3>
            <div className="space-y-3">
              <a 
                href="https://youtube.com/@footballmanager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
              >
                <span className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-xs font-bold">▶</span>
                <span>{t('liveStreams')}</span>
              </a>
              <a 
                href="https://facebook.com/footballmanager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors text-sm"
              >
                <span className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">f</span>
                <span>Facebook</span>
              </a>
              <a 
                href="https://instagram.com/footballmanager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-pink-500 transition-colors text-sm"
              >
                <span className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-xs font-bold">📷</span>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-football-green">{t('contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-football-green" />
                <span>{t('email')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-football-green" />
                <span>0987500844</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-football-green" />
                <span>{t('address')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 OpenFootball. {t('rights')}
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            {t('owner')}: OpenFootball Solutions
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
