import React from 'react';

const NavLink = ({ children, sectionId, handleNavClick }) => (
  <a
    href={`#${sectionId}`}
    onClick={(e) => {
      e.preventDefault();
      handleNavClick(sectionId);
    }}
    className="relative group font-medium text-gray-700 dark:text-gray-300 transition-colors"
  >
    <span>{children}</span>
    <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
  </a>
);

export default NavLink;
