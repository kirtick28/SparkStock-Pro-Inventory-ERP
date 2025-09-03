import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandPageImage from '../../assets/images/Landpage.png';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaRocket,
  FaChartLine,
  FaBox,
  FaUsers,
  FaCog,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';

export default function HeroSection() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: 'beforeChildren',
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.section
      id="hero"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col lg:flex-row items-center justify-between px-4 gap-12 sm:px-6 lg:gap-20 max-w-7xl mx-auto min-h-[calc(100vh-72px)] py-12"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className={`absolute top-20 right-20 w-32 h-32 rounded-full opacity-10 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-400 to-purple-500'
              : 'bg-gradient-to-br from-cyan-400 to-blue-500'
          }`}
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear'
          }}
          className={`absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-10 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-400 to-pink-500'
              : 'bg-gradient-to-br from-pink-400 to-red-500'
          }`}
        />
      </div>

      <HeroContent
        navigate={navigate}
        theme={theme}
        itemVariants={itemVariants}
      />
      <HeroImage
        theme={theme}
        itemVariants={itemVariants}
        floatingVariants={floatingVariants}
      />
    </motion.section>
  );
}

const HeroContent = ({ navigate, theme, itemVariants }) => (
  <motion.div
    variants={itemVariants}
    className="flex-1 text-center lg:text-left lg:pr-10 relative z-10"
  >
    {/* Badge */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300'
          : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-700'
      }`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <FaStar className="w-4 h-4" />
      </motion.div>
      <span className="text-sm font-semibold">Next-Gen ERP Solution</span>
    </motion.div>

    {/* Main Heading */}
    <motion.h1
      variants={itemVariants}
      className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 leading-tight"
    >
      {/* <motion.span
        className={`block mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Modern
      </motion.span> */}
      <motion.span
        className="block bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        Inventory & Billing
      </motion.span>
      <motion.span
        className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        Management
      </motion.span>
    </motion.h1>

    {/* Description */}
    <motion.p
      variants={itemVariants}
      className={`text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}
    >
      Streamline your business operations with{' '}
      <span className="font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        SparkPro
      </span>
      . Track inventory, manage billing, analyze sales, and empower your
      team—all in one powerful platform.
    </motion.p>

    {/* Feature Pills */}
    <motion.div
      variants={itemVariants}
      className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
    >
      {[
        { icon: FaBox, text: 'Smart Inventory' },
        { icon: FaChartLine, text: 'Real-time Analytics' },
        { icon: FaUsers, text: 'Team Management' }
      ].map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            theme === 'dark'
              ? 'bg-gray-800/50 text-gray-300 border border-gray-700'
              : 'bg-white/80 text-gray-700 border border-gray-200 shadow-sm'
          }`}
        >
          <feature.icon className="w-4 h-4" />
          <span>{feature.text}</span>
        </motion.div>
      ))}
    </motion.div>

    {/* CTA Button */}
    <motion.div
      variants={itemVariants}
      className="flex justify-center lg:justify-start"
    >
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/login')}
        className="group relative px-8 py-4 rounded-2xl font-bold text-white shadow-xl overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="group-hover:animate-none"
          >
            <FaRocket className="h-5 w-5" />
          </motion.div>
          <span>Get Started</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FaArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
      </motion.button>
    </motion.div>
  </motion.div>
);

const HeroImage = ({ theme, itemVariants, floatingVariants }) => (
  <motion.div
    variants={itemVariants}
    className="flex-1 flex justify-center items-center w-full lg:w-auto relative"
  >
    {/* Main Image Container */}
    <div className="relative">
      {/* Glowing Background */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`absolute inset-0 rounded-3xl blur-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30'
            : 'bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-cyan-400/20'
        }`}
      />

      {/* Image with enhanced effects */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <motion.img
            src={LandPageImage}
            alt="Inventory Management Illustration"
            className="w-full h-auto object-contain max-h-[500px] relative z-10"
            style={{
              filter:
                theme === 'dark'
                  ? 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.3))'
                  : 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Overlay gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`absolute inset-0 rounded-3xl ${
              theme === 'dark'
                ? 'bg-gradient-to-t from-gray-900/20 via-transparent to-blue-500/10'
                : 'bg-gradient-to-t from-white/20 via-transparent to-cyan-500/10'
            }`}
          />
        </motion.div>
      </motion.div>

      {/* Floating Icons */}
      {[
        { icon: FaBox, position: 'top-4 -left-4', delay: 0.8, color: 'blue' },
        {
          icon: FaChartLine,
          position: 'top-8 -right-6',
          delay: 1.2,
          color: 'purple'
        },
        {
          icon: FaUsers,
          position: 'bottom-8 -left-6',
          delay: 1.6,
          color: 'cyan'
        },
        {
          icon: FaCog,
          position: 'bottom-4 -right-4',
          delay: 2.0,
          color: 'pink'
        }
      ].map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: item.delay,
            type: 'spring',
            stiffness: 200
          }}
          className={`absolute ${item.position} z-20`}
        >
          <motion.div
            animate={{
              y: [-5, 5, -5],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2
            }}
            whileHover={{ scale: 1.2, rotate: 15 }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg cursor-pointer backdrop-blur-sm border border-white/20 ${
              item.color === 'blue'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                : item.color === 'purple'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                : item.color === 'cyan'
                ? 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                : 'bg-gradient-to-br from-pink-500 to-pink-600'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </motion.div>
        </motion.div>
      ))}

      {/* Particle Effects */}
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 2 + index * 0.5,
            repeat: Infinity,
            delay: index * 0.3,
            ease: 'easeInOut'
          }}
          className={`absolute w-2 h-2 rounded-full ${
            theme === 'dark' ? 'bg-blue-400' : 'bg-cyan-500'
          }`}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
        />
      ))}
    </div>
  </motion.div>
);
