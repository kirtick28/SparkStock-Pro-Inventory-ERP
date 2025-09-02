import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import LandPageImage from '../../assets/images/Landpage.png';
import { useTheme } from '../../contexts/ThemeContext';
import { FaRocket } from 'react-icons/fa';

export default function HeroSection() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-4 gap-10 sm:px-6 md:gap-20 max-w-7xl mx-auto min-h-[calc(100vh-72px)]">
      <HeroContent navigate={navigate} />
      <HeroImage theme={theme} />
    </section>
  );
}

const HeroContent = ({ navigate }) => (
  <motion.div
    initial={{ x: -80, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="flex-1 text-center md:text-left md:pr-10"
  >
    <h1 className="text-4xl md:text-5xl lg:text-6xl mt-4 font-extrabold mb-6 leading-tight">
      <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
        Modern Inventory & Billing{' '}
      </span>
      Management
    </h1>
    <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-xl md:max-w-none mx-auto md:mx-0 leading-relaxed">
      Streamline your business operations with{' '}
      <span className="font-semibold">SparkPro</span>. Track inventory, manage
      billing, analyze sales, and empower your team—all in one powerful
      platform.
    </p>
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/login')}
      className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg flex items-center gap-2 mx-auto md:mx-0"
    >
      <FaRocket className="h-5 w-5" />
      <span>Get Started</span>
    </motion.button>
  </motion.div>
);

const HeroImage = ({ theme }) => (
  <motion.div
    initial={{ x: 80, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="flex-1 flex justify-center items-center w-full md:w-auto"
  >
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.25}
      scale={1.05}
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
      className="flex justify-center items-center"
    >
      <img
        src={LandPageImage}
        alt="Inventory Management Illustration"
        className="w-full h-auto object-contain rounded-2xl"
        style={{
          maxHeight: '450px',
          width: 'auto',
          boxShadow: theme === 'dark' ? '0 8px 32px #222' : '0 8px 32px #ccc'
        }}
      />
    </Tilt>
  </motion.div>
);
