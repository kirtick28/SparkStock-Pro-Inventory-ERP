// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTheme } from '../contexts/ThemeContext';
// import { motion, AnimatePresence } from 'framer-motion';
// import LandPageImage from '../assets/images/Landpage.png';
// import Logo from '../assets/images/Logo.png';
// import Tilt from 'react-parallax-tilt';

// const features = [
//   {
//     title: 'Real-Time Inventory Tracking',
//     description:
//       'Monitor stock levels, product movements, and get instant updates to avoid shortages or overstocking.',
//     icon: '📦'
//   },
//   {
//     title: 'Advanced Billing System',
//     description:
//       'Generate invoices, manage orders, and streamline your sales process with automated billing tools.',
//     icon: '🧾'
//   },
//   {
//     title: 'Comprehensive Analytics',
//     description:
//       'Gain insights into sales, inventory trends, and customer behavior with powerful analytics dashboards.',
//     icon: '📊'
//   },
//   {
//     title: 'User & Role Management',
//     description:
//       'Control access, manage sub-admins, and ensure secure operations with robust user management.',
//     icon: '👥'
//   },
//   {
//     title: 'Gift Box & Promotions',
//     description:
//       'Create and manage gift boxes, special offers, and promotions to boost customer engagement.',
//     icon: '🎁'
//   }
// ];

// // Helper component for animated nav links
// const NavLink = ({ children, sectionId, handleNavClick }) => (
//   <a
//     href={`#${sectionId}`}
//     onClick={(e) => {
//       e.preventDefault();
//       handleNavClick(sectionId);
//     }}
//     className="relative group font-medium text-gray-700 dark:text-gray-300 transition-colors"
//   >
//     <span>{children}</span>
//     <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
//   </a>
// );

// export default function LandingPage() {
//   const { theme, toggleTheme } = useTheme();
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const headerRef = useRef(null);

//   const handleNavClick = (sectionId) => {
//     setIsMenuOpen(false); // Close mobile menu on click
//     const section = document.getElementById(sectionId);
//     if (section) {
//       // Reduced header height offset for smoother scrolling
//       const headerHeight = headerRef.current?.offsetHeight || 60;
//       const sectionTop =
//         section.getBoundingClientRect().top + window.scrollY - headerHeight;

//       window.scrollTo({
//         top: sectionTop,
//         behavior: 'smooth'
//       });
//     }
//   };

//   return (
//     <div
//       className={`min-h-screen flex flex-col ${
//         theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
//       } transition-colors duration-500`}
//     >
//       <motion.header
//         ref={headerRef}
//         initial={{ y: -80, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.6 }}
//         className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 sticky top-0 z-50 border-b border-gray-200/80 dark:border-gray-800/80"
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
//           {/* Logo and Nav links grouped on the left */}
//           <div className="flex items-center gap-8">
//             <div
//               className="flex items-center gap-2 cursor-pointer"
//               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//             >
//               <img
//                 src={Logo}
//                 alt="SparkPro Logo"
//                 className="h-10 w-10 rounded-full shadow-md"
//               />
//               <span className="text-xl sm:text-2xl font-extrabold tracking-wider">
//                 SparkPro
//               </span>
//             </div>
//             <nav className="hidden md:flex items-center gap-8 text-base">
//               <NavLink sectionId="features" handleNavClick={handleNavClick}>
//                 Features
//               </NavLink>
//               <NavLink sectionId="contact" handleNavClick={handleNavClick}>
//                 Contact
//               </NavLink>
//             </nav>
//           </div>

//           {/* Right Side: Theme Toggle & Login Button */}
//           <div className="hidden md:flex items-center gap-3">
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//               aria-label="Toggle theme"
//             >
//               {theme === 'dark' ? (
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//                 </svg>
//               ) : (
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 5.05a1 1 0 010 1.414l-.707.707a1 1 0 00-1.414-1.414l.707-.707a1 1 0 011.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               )}
//             </button>
//             <button
//               onClick={() => navigate('/login')}
//               className="px-5 py-2 rounded-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 text-sm"
//             >
//               Login
//             </button>
//           </div>

//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="z-50"
//               aria-label="Open menu"
//             >
//               <motion.div
//                 animate={isMenuOpen ? 'open' : 'closed'}
//                 className="w-6 h-6 flex flex-col justify-around items-center"
//               >
//                 <motion.span
//                   variants={{
//                     closed: { rotate: 0, y: 0 },
//                     open: { rotate: 45, y: 6 }
//                   }}
//                   className="w-full h-0.5 bg-gray-800 dark:bg-white"
//                 ></motion.span>
//                 <motion.span
//                   variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
//                   className="w-full h-0.5 bg-gray-800 dark:bg-white"
//                 ></motion.span>
//                 <motion.span
//                   variants={{
//                     closed: { rotate: 0, y: 0 },
//                     open: { rotate: -45, y: -6 }
//                   }}
//                   className="w-full h-0.5 bg-gray-800 dark:bg-white"
//                 ></motion.span>
//               </motion.div>
//             </button>
//           </div>
//         </div>

//         <AnimatePresence>
//           {isMenuOpen && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800"
//             >
//               <nav className="flex flex-col items-center gap-6 py-8">
//                 <button
//                   onClick={toggleTheme}
//                   className="p-3 rounded-full text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700"
//                   aria-label="Toggle theme"
//                 >
//                   {theme === 'dark' ? (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-6 w-6"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//                     </svg>
//                   ) : (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-6 w-6"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 5.05a1 1 0 010 1.414l-.707.707a1 1 0 00-1.414-1.414l.707-.707a1 1 0 011.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   )}
//                 </button>
//                 <a
//                   onClick={() => handleNavClick('features')}
//                   className="font-semibold text-lg cursor-pointer"
//                 >
//                   Features
//                 </a>
//                 <a
//                   onClick={() => handleNavClick('contact')}
//                   className="font-semibold text-lg cursor-pointer"
//                 >
//                   Contact
//                 </a>
//                 <button
//                   onClick={() => navigate('/login')}
//                   className="w-4/5 max-w-xs px-5 py-3 rounded-lg font-semibold bg-blue-600 text-white transition-all duration-300"
//                 >
//                   Login
//                 </button>
//               </nav>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.header>

//       <section className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:gap-20 max-w-7xl mx-auto min-h-[calc(100vh-72px)]">
//         <motion.div
//           initial={{ x: -80, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           className="flex-1 text-center md:text-left md:pr-10"
//         >
//           <h1 className="text-4xl md:text-5xl lg:text-6xl mt-4 font-extrabold mb-6 leading-tight">
//             <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
//               Modern Inventory & Billing{' '}
//             </span>
//             Management
//           </h1>
//           <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-xl md:max-w-none mx-auto md:mx-0 leading-relaxed">
//             Streamline your business operations with{' '}
//             <span className="font-semibold">SparkPro</span>. Track inventory,
//             manage billing, analyze sales, and empower your team—all in one
//             powerful platform.
//           </p>
//           <motion.button
//             whileHover={{ scale: 1.08 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => navigate('/login')}
//             className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg flex items-center gap-2 mx-auto md:mx-0"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>Get Started</span>
//           </motion.button>
//         </motion.div>
//         <motion.div
//           initial={{ x: 80, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           className="flex-1 flex justify-center items-center w-full md:w-auto"
//         >
//           <Tilt
//             glareEnable={true}
//             glareMaxOpacity={0.25}
//             scale={1.05}
//             tiltMaxAngleX={15}
//             tiltMaxAngleY={15}
//             className="flex justify-center items-center"
//           >
//             <img
//               src={LandPageImage}
//               alt="Inventory Management Illustration"
//               className="w-full h-auto object-contain rounded-2xl"
//               style={{
//                 maxHeight: '450px',
//                 width: 'auto',
//                 boxShadow:
//                   theme === 'dark' ? '0 8px 32px #222' : '0 8px 32px #ccc'
//               }}
//             />
//           </Tilt>
//         </motion.div>
//       </section>

//       <section
//         id="features"
//         className="px-4 sm:px-6 py-10 bg-white dark:bg-gray-800"
//       >
//         <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
//           ✨ Key Features
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
//           {features.map((feature, idx) => (
//             <Tilt key={idx} glareEnable={true} glareMaxOpacity={0.3}>
//               <motion.div
//                 initial={{ opacity: 0, y: 60 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, amount: 0.3 }}
//                 transition={{ duration: 0.6, delay: idx * 0.1 }}
//                 className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700 h-full"
//               >
//                 <span className="text-5xl mb-4">{feature.icon}</span>
//                 <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
//                 <p className="text-gray-600 dark:text-gray-300">
//                   {feature.description}
//                 </p>
//               </motion.div>
//             </Tilt>
//           ))}
//         </div>
//       </section>

//       <section id="contact" className="px-4 sm:px-6 py-10">
//         <div className="max-w-4xl mx-auto text-center">
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, amount: 0.5 }}
//             transition={{ duration: 0.5 }}
//             className="text-3xl md:text-4xl font-bold mb-4"
//           >
//             Get In Touch
//           </motion.h2>
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, amount: 0.5 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="text-lg text-gray-600 dark:text-gray-400 mb-12"
//           >
//             Have questions or want to learn more? We'd love to hear from you.
//           </motion.p>
//         </div>
//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 0.7 }}
//           className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
//         >
//           <form>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block text-sm font-medium mb-2"
//                 >
//                   Your Name
//                 </label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5 text-gray-400"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </span>
//                   <input
//                     type="text"
//                     id="name"
//                     className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                     placeholder="John Doe"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium mb-2"
//                 >
//                   Your Email
//                 </label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5 text-gray-400"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                       <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                     </svg>
//                   </span>
//                   <input
//                     type="email"
//                     id="email"
//                     className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                     placeholder="john.doe@example.com"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="mb-6">
//               <label
//                 htmlFor="message"
//                 className="block text-sm font-medium mb-2"
//               >
//                 Message
//               </label>
//               <textarea
//                 id="message"
//                 rows="5"
//                 className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                 placeholder="Your message here..."
//               ></textarea>
//             </div>
//             <div className="text-center">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 type="submit"
//                 className="px-10 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
//               >
//                 Send Message
//               </motion.button>
//             </div>
//           </form>
//         </motion.div>
//       </section>

//       <motion.footer
//         initial={{ opacity: 0 }}
//         whileInView={{ opacity: 1 }}
//         viewport={{ once: true }}
//         className="mt-auto py-6 text-center text-sm text-gray-500 dark:text-gray-400"
//       >
//         &copy; {new Date().getFullYear()} SparkPro Inventory & Billing System.
//         All rights reserved.
//       </motion.footer>
//     </div>
//   );
// }

import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/LandingPage/Header';
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

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } transition-colors duration-500`}
    >
      <Header ref={headerRef} handleNavClick={handleNavClick} />
      <HeroSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
