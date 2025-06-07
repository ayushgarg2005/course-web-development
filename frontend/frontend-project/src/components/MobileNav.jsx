import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faCartArrowDown,
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faUser,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';

export const MobileNav = ({ isAuthenticated, onLogout, setIsMenuOpen }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path ? 'text-blue-600 font-bold' : 'text-black hover:text-gray-700';

  const handleLogout = () => {
    setIsModalOpen(true); // Open the logout confirmation modal
  };

  const confirmLogout = () => {
    onLogout();
    setIsModalOpen(false); // Close modal after logout
    setIsMenuOpen(false); // Close mobile menu
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal without logging out
  };

  return (
    <div className="lg:hidden bg-white shadow-md">
      <div className="flex flex-col items-center gap-6 py-4">
        <NavItem to="/" icon={faHome} label="Home" isActive={isActive} setIsMenuOpen={setIsMenuOpen} />

        {isAuthenticated ? (
          <>
            <NavItem to="/purchased-courses" icon={faCartArrowDown} label="My Courses" isActive={isActive} setIsMenuOpen={setIsMenuOpen} />
            <NavItem to="/cart" icon={faShoppingCart} label="Cart" isActive={isActive} setIsMenuOpen={setIsMenuOpen} />
            <NavItem to="/profile" icon={faUser} label="Profile" isActive={isActive} setIsMenuOpen={setIsMenuOpen} />

            {/* Logout Button with Modal */}
            <button onClick={handleLogout} className="text-lg font-semibold py-2 px-4 hover:text-gray-700">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavItem to="/signup" icon={faUserPlus} label="Sign Up" isActive={isActive} setIsMenuOpen={setIsMenuOpen} />
            <NavItem to="/signin" icon={faSignInAlt} label="Sign In" isActive={isActive} setIsMenuOpen={setIsMenuOpen} />
          </>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Would you like to log out?</h3>
            <div className="flex justify-end gap-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={confirmLogout} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ to, icon, label, isActive, setIsMenuOpen }) => (
  <Link to={to} className={`text-lg font-semibold py-2 px-4 rounded-lg ${isActive(to)}`} onClick={() => setIsMenuOpen(false)}>
    <FontAwesomeIcon icon={icon} className="mr-2" />
    {label}
  </Link>
);

