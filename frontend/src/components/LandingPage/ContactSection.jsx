import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaComment,
  FaPaperPlane,
  FaCheckCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

export default function ContactSection() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

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
      id="contact"
      className={`relative px-4 sm:px-6 py-20 lg:py-24 overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black'
          : 'bg-gradient-to-br from-white via-gray-50 to-blue-50'
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
          className={`absolute top-20 right-20 w-64 h-64 rounded-full opacity-5 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
              : 'bg-gradient-to-br from-blue-400 to-purple-500'
          }`}
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear'
          }}
          className={`absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-5 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-400 to-pink-500'
              : 'bg-gradient-to-br from-cyan-400 to-teal-500'
          }`}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <ContactHeader theme={theme} itemVariants={itemVariants} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <ContactInfo theme={theme} itemVariants={itemVariants} />
          <ContactForm
            theme={theme}
            itemVariants={itemVariants}
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSubmitted={isSubmitted}
          />
        </div>
      </motion.div>
    </section>
  );
}

const ContactHeader = ({ theme, itemVariants }) => (
  <motion.div variants={itemVariants} className="text-center mb-16">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300'
          : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700'
      }`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FaComment className="w-4 h-4" />
      </motion.div>
      <span className="text-sm font-semibold">Let's Connect</span>
    </motion.div>

    <motion.h2
      variants={itemVariants}
      className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}
    >
      <span className="block mb-2">Ready to Transform</span>
      <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
        Your Business?
      </span>
    </motion.h2>

    <motion.p
      variants={itemVariants}
      className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}
    >
      Get in touch with our team to discuss how SparkPro can streamline your
      operations and boost your productivity.
    </motion.p>
  </motion.div>
);

const ContactInfo = ({ theme, itemVariants }) => (
  <motion.div variants={itemVariants} className="lg:col-span-1">
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl p-8 h-full ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50'
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50'
      } backdrop-blur-lg shadow-xl`}
    >
      <h3
        className={`text-2xl font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        Contact Information
      </h3>

      <div className="space-y-6">
        {[
          {
            icon: FaEnvelope,
            title: 'Email',
            content: 'kirtick.mm@gmail.com',
            color: 'blue'
          },
          {
            icon: FaPhone,
            title: 'Phone',
            content: '+91 96005 70881',
            color: 'cyan'
          },
          {
            icon: FaMapMarkerAlt,
            title: 'Address',
            content: 'Sri Eshwar College of Engineering, Coimbatore',
            color: 'purple'
          },
          {
            icon: FaClock,
            title: 'Business Hours',
            content: 'Mon-Fri: 9AM-6PM',
            color: 'green'
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ x: 10, scale: 1.02 }}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
          >
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                item.color === 'blue'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : item.color === 'cyan'
                  ? 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                  : item.color === 'purple'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                  : 'bg-gradient-to-br from-green-500 to-green-600'
              } text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <h4
                className={`font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {item.title}
              </h4>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {item.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Social Links or Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <p
          className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          We typically respond within 24 hours during business days.
        </p>
      </motion.div>
    </motion.div>
  </motion.div>
);

const ContactForm = ({
  theme,
  itemVariants,
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  isSubmitted
}) => (
  <motion.div variants={itemVariants} className="lg:col-span-2">
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl p-8 h-full ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50'
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50'
      } backdrop-blur-lg shadow-xl`}
    >
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 2 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white mb-4"
          >
            <FaCheckCircle className="w-8 h-8" />
          </motion.div>
          <h3
            className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Message Sent Successfully!
          </h3>
          <p
            className={`text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            We'll get back to you within 24 hours.
          </p>
        </motion.div>
      ) : (
        <>
          <h3
            className={`text-2xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Send us a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                id="name"
                name="name"
                label="Your Name"
                type="text"
                placeholder="John Doe"
                icon={
                  <FaUser
                    className={
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }
                  />
                }
                value={formData.name}
                onChange={handleChange}
                theme={theme}
                required
              />
              <FormField
                id="email"
                name="email"
                label="Your Email"
                type="email"
                placeholder="john.doe@example.com"
                icon={
                  <FaEnvelope
                    className={
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }
                  />
                }
                value={formData.email}
                onChange={handleChange}
                theme={theme}
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Message
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3 z-10">
                  <FaComment
                    className={
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }
                  />
                </span>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:bg-gray-700'
                      : 'bg-gray-50/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  }`}
                  placeholder="Tell us about your project or ask us anything..."
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full py-4 px-8 rounded-xl font-bold text-white transition-all duration-300 overflow-hidden ${
                isSubmitting
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:shadow-xl'
              } bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500`}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-5 h-5" />
                    <span>Send Message</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaPaperPlane className="w-4 h-4" />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.button>
          </form>
        </>
      )}
    </motion.div>
  </motion.div>
);

const FormField = ({
  id,
  name,
  label,
  type,
  placeholder,
  icon,
  value,
  onChange,
  theme,
  required
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <label
      htmlFor={id}
      className={`block text-sm font-semibold mb-2 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}
    >
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
        {icon}
      </span>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
          theme === 'dark'
            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:bg-gray-700'
            : 'bg-gray-50/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
        }`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  </motion.div>
);
