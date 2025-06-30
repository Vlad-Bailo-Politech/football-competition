import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button';
import { Globe, LogIn, Menu, X, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import LoginForm from './LoginForm';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/');
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const navItems = [
    { label: t('home'), path: '/' },
    { label: t('tournaments'), path: '/tournaments' },
    { label: t('matches'), path: '/matches' },
    { label: t('teams'), path: '/teams' },
    { label: t('participants'), path: '/participants' },
    { label: t('contacts'), path: '/contacts' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-football-gradient rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              OpenFootball
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors hover:text-football-green ${isActive(item.path)
                  ? 'text-football-green border-b-2 border-football-green pb-1'
                  : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Language Switcher & User Buttons */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{i18n.language === 'ua' ? 'УКР' : 'ENG'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <DropdownMenuItem onClick={() => changeLanguage('ua')} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  Українська
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentUser ? (
              <>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-football-gradient hover:bg-football-green-dark text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('cabinet')}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-100"
                >
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-football-gradient hover:bg-football-green-dark text-white">
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('login')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{t('login')}</DialogTitle>
                  </DialogHeader>
                  <LoginForm />
                </DialogContent>
              </Dialog>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-football-green transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium transition-colors hover:text-football-green ${isActive(item.path)
                    ? 'text-football-green'
                    : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
