import { Loader as LucideLoader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const Loader = ({ size = 24, className = '', fullScreen = false }) => {
  const { theme } = useTheme();

  const loader = (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`inline-block ${className}`}
    >
      <LucideLoader
        size={size}
        className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}
      />
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${
          theme === 'dark' ? 'bg-black bg-opacity-80' : 'bg-white bg-opacity-80'
        } z-50`}
      >
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
