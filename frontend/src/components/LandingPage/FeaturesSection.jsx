import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaBox,
  FaFileInvoice,
  FaChartBar,
  FaUsers,
  FaGift,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';

const features = [
  {
    title: 'Real-Time Inventory Tracking',
    description:
      'Monitor stock levels, product movements, and get instant updates to avoid shortages or overstocking.',
    icon: FaBox,
    color: 'blue',
    highlights: ['Live Updates', 'Stock Alerts', 'Movement History']
  },
  {
    title: 'Advanced Billing System',
    description:
      'Generate invoices, manage orders, and streamline your sales process with automated billing tools.',
    icon: FaFileInvoice,
    color: 'purple',
    highlights: ['Auto Invoicing', 'Order Management', 'Payment Tracking']
  },
  {
    title: 'Comprehensive Analytics',
    description:
      'Gain insights into sales, inventory trends, and customer behavior with powerful analytics dashboards.',
    icon: FaChartBar,
    color: 'cyan',
    highlights: ['Sales Insights', 'Trend Analysis', 'Custom Reports']
  },
  {
    title: 'User & Role Management',
    description:
      'Control access, manage sub-admins, and ensure secure operations with robust user management.',
    icon: FaUsers,
    color: 'green',
    highlights: ['Role Based Access', 'Team Management', 'Security Controls']
  },
  {
    title: 'Gift Box & Promotions',
    description:
      'Create and manage gift boxes, special offers, and promotions to boost customer engagement.',
    icon: FaGift,
    color: 'pink',
    highlights: ['Custom Bundles', 'Promo Codes', 'Seasonal Offers']
  }
];

export default function FeaturesSection() {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: 'beforeChildren',
        staggerChildren: 0.1
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

  return (
    <section
      id="features"
      className={`relative px-4 sm:px-6 py-20 lg:py-24 overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
          : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear'
          }}
          className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 ${
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
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className={`absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-5 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-400 to-pink-500'
              : 'bg-gradient-to-br from-pink-400 to-red-500'
          }`}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
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
              <FaCheckCircle className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-semibold">Feature Rich Platform</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <span className="block mb-2">Powerful Features for</span>
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Modern Business
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Discover the comprehensive suite of tools designed to streamline
            your business operations and boost productivity.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              feature={feature}
              index={idx}
              theme={theme}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

const FeatureCard = ({ feature, index, theme }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        icon:
          theme === 'dark'
            ? 'from-blue-400 to-blue-600'
            : 'from-blue-500 to-blue-700',
        border: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-300/50',
        glow: theme === 'dark' ? 'shadow-blue-500/20' : 'shadow-blue-500/10'
      },
      purple: {
        icon:
          theme === 'dark'
            ? 'from-purple-400 to-purple-600'
            : 'from-purple-500 to-purple-700',
        border:
          theme === 'dark' ? 'border-purple-500/30' : 'border-purple-300/50',
        glow: theme === 'dark' ? 'shadow-purple-500/20' : 'shadow-purple-500/10'
      },
      cyan: {
        icon:
          theme === 'dark'
            ? 'from-cyan-400 to-cyan-600'
            : 'from-cyan-500 to-cyan-700',
        border: theme === 'dark' ? 'border-cyan-500/30' : 'border-cyan-300/50',
        glow: theme === 'dark' ? 'shadow-cyan-500/20' : 'shadow-cyan-500/10'
      },
      green: {
        icon:
          theme === 'dark'
            ? 'from-green-400 to-green-600'
            : 'from-green-500 to-green-700',
        border:
          theme === 'dark' ? 'border-green-500/30' : 'border-green-300/50',
        glow: theme === 'dark' ? 'shadow-green-500/20' : 'shadow-green-500/10'
      },
      pink: {
        icon:
          theme === 'dark'
            ? 'from-pink-400 to-pink-600'
            : 'from-pink-500 to-pink-700',
        border: theme === 'dark' ? 'border-pink-500/30' : 'border-pink-300/50',
        glow: theme === 'dark' ? 'shadow-pink-500/20' : 'shadow-pink-500/10'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(feature.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-2xl p-8 h-full transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 hover:border-gray-600/50'
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 hover:border-gray-300/50'
      } backdrop-blur-lg shadow-xl hover:shadow-2xl ${colorClasses.glow}`}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${colorClasses.icon}`}
      />

      {/* Icon */}
      <motion.div
        whileHover={{
          scale: 1.1,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.5 }
        }}
        className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br ${colorClasses.icon} text-white shadow-lg ${colorClasses.glow}`}
      >
        <feature.icon className="w-7 h-7" />

        {/* Floating particles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.2
          }}
          className="absolute inset-0 rounded-2xl border-2 border-white/30"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          className={`text-xl lg:text-2xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {feature.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          className={`text-base leading-relaxed mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {feature.description}
        </motion.p>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
          className="space-y-2 mb-6"
        >
          {feature.highlights.map((highlight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.5 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colorClasses.icon}`}
              />
              <span
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {highlight}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Learn More Link */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
          className="flex items-center gap-2 group/link cursor-pointer"
        >
          <span
            className={`text-sm font-semibold bg-gradient-to-r ${colorClasses.icon} bg-clip-text text-transparent`}
          >
            Learn More
          </span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FaArrowRight
              className={`w-3 h-3 text-current bg-gradient-to-r ${colorClasses.icon} bg-clip-text text-transparent group-hover/link:translate-x-1 transition-transform duration-300`}
            />
          </motion.div>
        </motion.div> */}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-20">
        <div
          className={`w-16 h-16 border border-current rounded-full ${colorClasses.border}`}
        />
      </div>
    </motion.div>
  );
};
