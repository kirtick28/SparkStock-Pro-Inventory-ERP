import React from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

const features = [
  {
    title: 'Real-Time Inventory Tracking',
    description:
      'Monitor stock levels, product movements, and get instant updates to avoid shortages or overstocking.',
    icon: '📦'
  },
  {
    title: 'Advanced Billing System',
    description:
      'Generate invoices, manage orders, and streamline your sales process with automated billing tools.',
    icon: '🧾'
  },
  {
    title: 'Comprehensive Analytics',
    description:
      'Gain insights into sales, inventory trends, and customer behavior with powerful analytics dashboards.',
    icon: '📊'
  },
  {
    title: 'User & Role Management',
    description:
      'Control access, manage sub-admins, and ensure secure operations with robust user management.',
    icon: '👥'
  },
  {
    title: 'Gift Box & Promotions',
    description:
      'Create and manage gift boxes, special offers, and promotions to boost customer engagement.',
    icon: '🎁'
  }
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="px-4 sm:px-6 py-10 bg-white dark:bg-gray-800"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        ✨ Key Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {features.map((feature, idx) => (
          <FeatureCard key={idx} feature={feature} index={idx} />
        ))}
      </div>
    </section>
  );
}

const FeatureCard = ({ feature, index }) => (
  <Tilt key={index} glareEnable={true} glareMaxOpacity={0.3}>
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700 h-full"
    >
      <span className="text-5xl mb-4">{feature.icon}</span>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
    </motion.div>
  </Tilt>
);
