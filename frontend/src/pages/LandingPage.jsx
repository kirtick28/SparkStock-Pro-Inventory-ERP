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
      const headerHeight = headerRef.current?.offsetHeight || 60;
      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      });
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
      <SharedHeader
        variant="landing"
        showNavigation={true}
        navigationItems={navigationItems}
        showLoginButton={true}
        handleNavClick={handleNavClick}
      />
      <HeroSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
