import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope } from 'react-icons/fa';

export default function ContactSection() {
  return (
    <section id="contact" className="px-4 sm:px-6 py-10">
      <ContactHeader />
      <ContactForm />
    </section>
  );
}

const ContactHeader = () => (
  <div className="max-w-4xl mx-auto text-center">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="text-3xl md:text-4xl font-bold mb-4"
    >
      Get In Touch
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-lg text-gray-600 dark:text-gray-400 mb-12"
    >
      Have questions or want to learn more? We'd love to hear from you.
    </motion.p>
  </div>
);

const ContactForm = () => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7 }}
    className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
  >
    <form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FormField
          id="name"
          label="Your Name"
          type="text"
          placeholder="John Doe"
          icon={<FaUser className="text-gray-400" />}
        />
        <FormField
          id="email"
          label="Your Email"
          type="email"
          placeholder="john.doe@example.com"
          icon={<FaEnvelope className="text-gray-400" />}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          id="message"
          rows="5"
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Your message here..."
        ></textarea>
      </div>
      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="px-10 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
        >
          Send Message
        </motion.button>
      </div>
    </form>
  </motion.div>
);

const FormField = ({ id, label, type, placeholder, icon }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </span>
      <input
        type={type}
        id={id}
        className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        placeholder={placeholder}
      />
    </div>
  </div>
);
