import React from 'react';
import { FaPlus, FaListAlt, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';

const IconTest = () => {
  // This is the correct way to use icons in React 18
  return (
    <div>
      <h1>Icon Test</h1>
      <div>
        <FaPlus size={18} />
        <FaListAlt size={18} />
        <FaUser size={18} />
        <FaSignOutAlt size={18} />
        <FaBars size={18} />
      </div>
    </div>
  );
};

export default IconTest; 