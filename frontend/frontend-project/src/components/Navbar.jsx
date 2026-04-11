import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import DesktopNav from './DesktopNav';
import { MobileNav } from './MobileNav';
import { useAuth } from './useAuth';

export const Navbar = () => {
  const { isAuthenticated, userRole, onLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  console.log("nav ", isAuthenticated);
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Website Name */}
        <div className="text-2xl font-extrabold text-gray-800">
          <Link to="/">AppStore</Link>
        </div>
        {/* Desktop Navigation */}
        <DesktopNav isAuthenticated={isAuthenticated} userRole={userRole} onLogout={onLogout} />

        {/* Hamburger Menu for Mobile */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800 focus:outline-none"
          >
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <MobileNav 
          isAuthenticated={isAuthenticated} 
          userRole={userRole} 
          onLogout={onLogout} 
          setIsMenuOpen={setIsMenuOpen} 
        />
      )}
    </nav>
  );
};
