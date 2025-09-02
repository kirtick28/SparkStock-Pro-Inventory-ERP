import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';
import Logo from '../../assets/images/Logo.png';
import NavLink from './NavLink';
import MobileMenu from './MobileMenu';

export default function Header({ handleNavClick }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 sticky top-0 z-50 border-b border-gray-200/80 dark:border-gray-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo and Nav links grouped on the left */}
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src={Logo}
              alt="SparkPro Logo"
              className="h-10 w-10 rounded-full shadow-md"
            />
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider">
              SparkPro
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-base">
            <NavLink sectionId="features" handleNavClick={handleNavClick}>
              Features
            </NavLink>
            <NavLink sectionId="contact" handleNavClick={handleNavClick}>
              Contact
            </NavLink>
          </nav>
        </div>

        {/* Right Side: Theme Toggle & Login Button */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <LoginButton navigate={navigate} />
        </div>

        <div className="md:hidden flex items-center">
          <HamburgerMenu
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            theme={theme}
          />
        </div>
      </div>

      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        handleNavClick={handleNavClick}
        navigate={navigate}
      />
    </motion.header>
  );
}

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? <FaMoon size={20} /> : <FaSun size={20} />}
  </button>
);

const LoginButton = ({ navigate }) => (
  <button
    onClick={() => navigate('/login')}
    className="px-5 py-2 rounded-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 text-sm"
  >
    Login
  </button>
);

const HamburgerMenu = ({ isMenuOpen, setIsMenuOpen, theme }) => (
  <button
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    className="z-50"
    aria-label="Open menu"
  >
    <motion.div
      animate={isMenuOpen ? 'open' : 'closed'}
      className="w-6 h-6 flex flex-col justify-around items-center"
    >
      <motion.span
        variants={{
          closed: { rotate: 0, y: 0 },
          open: { rotate: 45, y: 6 }
        }}
        className="w-full h-0.5 bg-gray-800 dark:bg-white"
      ></motion.span>
      <motion.span
        variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
        className="w-full h-0.5 bg-gray-800 dark:bg-white"
      ></motion.span>
      <motion.span
        variants={{
          closed: { rotate: 0, y: 0 },
          open: { rotate: -45, y: -6 }
        }}
        className="w-full h-0.5 bg-gray-800 dark:bg-white"
      ></motion.span>
    </motion.div>
  </button>
);
