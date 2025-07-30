import React from "react";
import { Link } from 'react-router-dom';
import "./Nav.css";
import Search from "./Search"
import { TFunction } from "react-i18next";

interface NavProps {
  show: boolean;
  dropdownOpen: boolean;
  handleAvatarClick: () => void;
  handleSignOut: () => void;
  t: TFunction; // Pass the translation function
}

const Nav: React.FC<NavProps> = ({
  show,
  dropdownOpen,
  handleAvatarClick,
  handleSignOut,
  t,
}) => {
  return (
    <div className={`nav ${show && "nav_black"}`}>
      <Link to="/home">
        <img 
          className="nav_logo"
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix Logo"
        />
      </Link>
      <div className="nav_search">
        <Search />
      </div>
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
                  // setDropdownOpen(false); // This state is now managed by the container
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