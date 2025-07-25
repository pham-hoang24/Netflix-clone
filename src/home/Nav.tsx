import React, { useState, useEffect, useCallback } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import "./Nav.css";
// import Search from "./Search"
import { useTranslation } from "react-i18next";


const Nav: React.FC = () => {
  const [show, handleShow] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleScroll = useCallback(() => {
    if (window.scrollY > 100) {
      handleShow(true);
    } else {
      handleShow(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const handleAvatarClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    logout();
    setDropdownOpen(false);
  };
  return (
    <div className={`nav ${show && "nav_black"}`}>
      <Link to="/home">
        <img 
          className="nav_logo"
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix Logo"
        />
      </Link>
      {/* <div className="nav_search">
        <Search />
      </div> */}
        <div className="nav_avatar_container">
          <img
            className="nav_avatar"
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            alt="Netflix Avatar"
            onClick={handleAvatarClick}
          />
          {dropdownOpen && (
            <div className="nav_dropdown">
              <Link
                to="/settings"
                className="nav_dropdown_item"
                onClick={() => {
                  console.log('clicked settings link');
                  setDropdownOpen(false);
                }}>
                {t('nav.settings')}
              </Link>
              <button onClick={handleSignOut} className="nav_dropdown_item">
                {t('nav.signOut')}
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

export default Nav;
