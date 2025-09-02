import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-auto py-6 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      &copy; {new Date().getFullYear()} SparkPro Inventory & Billing System. All
      rights reserved.
    </motion.footer>
  );
}
