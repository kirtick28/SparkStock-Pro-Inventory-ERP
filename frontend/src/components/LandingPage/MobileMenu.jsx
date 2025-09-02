import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';

const MobileMenu = ({
  isMenuOpen,
  setIsMenuOpen,
  theme,
  toggleTheme,
  handleNavClick,
  navigate
}) => (
  <AnimatePresence>
    {isMenuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800"
      >
        <nav className="flex flex-col items-center gap-6 py-8">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FaMoon size={20} /> : <FaSun size={20} />}
          </button>
          <a
            onClick={() => {
              handleNavClick('features');
              setIsMenuOpen(false);
            }}
            className="font-semibold text-lg cursor-pointer"
          >
            Features
          </a>
          <a
            onClick={() => {
              handleNavClick('contact');
              setIsMenuOpen(false);
            }}
            className="font-semibold text-lg cursor-pointer"
          >
            Contact
          </a>
          <button
            onClick={() => navigate('/login')}
            className="w-4/5 max-w-xs px-5 py-3 rounded-lg font-semibold bg-blue-600 text-white transition-all duration-300"
          >
            Login
          </button>
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MobileMenu;
