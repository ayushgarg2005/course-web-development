import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCartArrowDown,
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faUser,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

const DesktopNav = ({ isAuthenticated, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    onLogout();
    navigate("/");
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="hidden lg:flex items-center gap-6">
      <NavItem to="/" icon={faHome} label="Home" location={location} />
      {isAuthenticated ? (
        <>
          <NavItem to="/purchased-courses" icon={faCartArrowDown} label="My Courses" location={location} />
          <NavItem to="/cart" icon={faShoppingCart} label="Cart" location={location} />
          <NavItem to="/profile" icon={faUser} label="Profile" location={location} />
          <button
            onClick={handleLogout}
            className="text-xl font-semibold py-2 px-4 rounded-lg hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
          </button>
        </>
      ) : (
        <>
          <NavItem to="/signup" icon={faUserPlus} label="Sign Up" location={location} />
          <NavItem to="/signin" icon={faSignInAlt} label="Sign In" location={location} />
        </>
      )}

      {/* Modal for logout confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Would you like to log out?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ NavItem Component (Only Text Color Change)
const NavItem = ({ to, icon, label, location }) => {
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-xl font-semibold py-2 px-4 transition-all duration-300 ease-in-out 
        ${isActive ? "text-blue-600 font-bold" : "text-black hover:text-gray-700"}`}
    >
      <FontAwesomeIcon icon={icon} className="mr-2" /> {label}
    </Link>
  );
};

export default DesktopNav;
