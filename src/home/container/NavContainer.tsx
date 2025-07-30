import React, { useState, useEffect, useCallback } from "react";
import Nav from '../Nav'; // Import the presentational component
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from "react-i18next";

const NavContainer: React.FC = () => {
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
    <Nav
      show={show}
      dropdownOpen={dropdownOpen}
      handleAvatarClick={handleAvatarClick}
      handleSignOut={handleSignOut}
      t={t}
    />
  );
};

export default NavContainer;
