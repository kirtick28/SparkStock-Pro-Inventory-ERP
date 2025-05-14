import React, { useState } from 'react'; // Import useState
import Products from './Products';
import GiftBoxes from './GiftBoxes';
import { useTheme } from '../../../contexts/ThemeContext';

const GiftBox = () => {
  const { theme } = useTheme();
  const [giftBoxVersion, setGiftBoxVersion] = useState(0);

  const refreshGiftBoxes = () => {
    setGiftBoxVersion((prevVersion) => prevVersion + 1);
  };

  return (
    <div>
      <main
        className={`${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        } min-h-screen`}
      >
        <Products onGiftOperationSuccess={refreshGiftBoxes} />
        <GiftBoxes
          key={giftBoxVersion}
          onGiftOperationSuccess={refreshGiftBoxes}
        />
      </main>
    </div>
  );
};

export default GiftBox;
