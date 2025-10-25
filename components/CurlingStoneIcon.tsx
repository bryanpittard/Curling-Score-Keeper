import React from 'react';

interface CurlingStoneIconProps {
  color: 'red' | 'yellow';
  className?: string;
}

const CurlingStoneIcon: React.FC<CurlingStoneIconProps> = ({ color, className = '' }) => {
  return (
    <svg
      viewBox="0 0 120 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Gradient for the stone body to give a polished granite look */}
        <radialGradient id="stoneGradient" cx="50%" cy="50%" r="65%" fx="50%" fy="30%">
          <stop offset="0%" stopColor="#f0f0f0" />
          <stop offset="60%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#9ca3af" />
        </radialGradient>
        
        {/* Gradients for the plastic handle */}
        <linearGradient id="handleGradientRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="handleGradientYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Gradient for the handle highlight */}
        <linearGradient id="handleHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Filter for a soft shadow */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
            <feMerge>
                <feMergeNode in="offsetBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
      </defs>

      <g filter="url(#softShadow)">
        {/* Stone Body */}
        <path
          d="M10,50 C10,20 110,20 110,50 C118,60 118,85 110,85 L10,85 C2,85 2,60 10,50 Z"
          fill="url(#stoneGradient)"
          stroke="#4b5563"
          strokeWidth="0.5"
        />

        {/* Running Band */}
        <path 
          d="M10 58 C10 55, 110 55, 110 58 L 110 72 C 110 75, 10 75, 10 72 L 10 58 Z"
          fill="#9ca3af"
          stroke="#4b5563" 
          strokeWidth="0.25"
        />
        {/* Highlight on running band */}
        <path
          d="M10 58 C10 55, 110 55, 110 58 L 110 62 C 110 59, 10 59, 10 62 L 10 58 Z"
          fill="white"
          fillOpacity="0.2"
        />

        {/* Handle Mount and Uprights */}
        <ellipse cx="60" cy="48" rx="15" ry="5" fill="#d1d5db" stroke="#6b7280" strokeWidth="0.5" />
        <rect x="48" y="25" width="8" height="23" fill="#d1d5db" stroke="#6b7280" strokeWidth="0.5" rx="1" />
        <rect x="64" y="25" width="8" height="23" fill="#d1d5db" stroke="#6b7280" strokeWidth="0.5" rx="1" />
        
        {/* Handle Grip */}
        <path 
          d="M48,25 C43,25 43,10 48,10 L72,10 C77,10 77,25 72,25" 
          fill={color === 'red' ? 'url(#handleGradientRed)' : 'url(#handleGradientYellow)'}
          stroke="#374151"
          strokeWidth="1"
        />
        
        {/* Handle Grip Highlight */}
        <path 
          d="M50,13 C47,13 47,12 50,12 L70,12 C73,12 73,13 70,13" 
          fill="url(#handleHighlight)"
        />
      </g>
    </svg>
  );
};

export default CurlingStoneIcon;
