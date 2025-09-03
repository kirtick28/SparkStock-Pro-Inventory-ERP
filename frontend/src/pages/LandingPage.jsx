import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SharedHeader from '../components/common/SharedHeader';
import HeroSection from '../components/LandingPage/HeroSection';
import FeaturesSection from '../components/LandingPage/FeaturesSection';
import ContactSection from '../components/LandingPage/ContactSection';
import Footer from '../components/LandingPage/Footer';

export default function LandingPage() {
  const { theme } = useTheme();
  const headerRef = useRef(null);

  const handleNavClick = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // Small delay to ensure mobile menu closes first
      setTimeout(() => {
        // Get the current header height dynamically
        const headerElement = headerRef.current;
        const headerHeight = headerElement
          ? headerElement.getBoundingClientRect().height
          : 80;

        // Use a larger offset to ensure the section is properly visible
        // Account for sticky header + extra spacing
        const offset = headerHeight - 130; // Increased buffer for better visibility

        const sectionTop =
          section.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top: Math.max(0, sectionTop), // Ensure we don't scroll to negative values
          behavior: 'smooth'
        });
      }, 150); // Increased delay to ensure mobile menu animation completes
    }
  };

  const navigationItems = [
    { id: 'features', label: 'Features' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } transition-colors duration-500`}
    >
      <div ref={headerRef}>
        <SharedHeader
          variant="landing"
          showNavigation={true}
          navigationItems={navigationItems}
          showLoginButton={true}
          handleNavClick={handleNavClick}
        />
      </div>
      <HeroSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
