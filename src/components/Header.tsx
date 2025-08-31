import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { 
      name: 'Главная', 
      path: '/', 
      icon: (
        <svg className="icon-standard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 3 2 10v1h2v10h16V11h2v-1zM10 20v-6h4v6z"/>
        </svg>
      ) 
    },
    { 
      name: 'Документы', 
      path: '/documents', 
      icon: (
        <svg className="icon-standard" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      ) 
    },
    { 
      name: 'Вход', 
      path: '/login', 
      icon: (
        <svg className="icon-standard" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <circle cx="12" cy="12" r="11"/>
          <circle cx="12" cy="9" r="3"/>
          <path d="M5 20c0-3 3-5 7-5s7 2 7 5"/>
        </svg>
      ) 
    },
  ];

  return (
    <header className="header-bg text-white shadow-lg mb-8">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-shrink-0 mr-6">
            <Link to="/" onClick={closeMenu} className="flex items-center">
              <img
                src="https://www.sronoso.ru/upload/iblock/cc4/5n62e3m1ow3llchi2t0d2iqqottjt6ad/noso_logo.gif"
                alt="Логотип СРО НОСО"
                className="h-14 w-auto mr-3"
              />
              <span className="font-bold text-xl tracking-tight hidden md:block">СРО НОСО</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`nav-link flex items-center ${
                  location.pathname === link.path ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                {link.icon}
                <span className="ml-1">{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-white hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu pt-16 pb-4">
            <nav className="flex flex-col space-y-3 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`nav-link flex items-center py-3 ${
                    location.pathname === link.path ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
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