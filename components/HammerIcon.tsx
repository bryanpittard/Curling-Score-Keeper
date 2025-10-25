import React from 'react';

interface HammerIconProps {
  className?: string;
}

const HammerIcon: React.FC<HammerIconProps> = ({ className = '' }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`w-6 h-6 inline-block ml-1.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] ${className}`}
        aria-label="Has hammer"
        role="img"
    >
      <path 
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20V10H20C21.1046 10 22 9.10457 22 8V4C22 2.89543 21.1046 2 20 2H4C2.89543 2 2 2.89543 2 4V8C2 9.10457 2.89543 10 4 10H10V20Z" 
      />
    </svg>
  );
};

export default HammerIcon;