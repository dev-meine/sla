import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40 }) => {
  return (
    <img 
      src="https://i.ibb.co/twnDkKQ4/SLA.png" 
      alt="Sierra Leone Aquatics Logo" 
      style={{ 
        width: size,
        height: size,
      }}
      className="rounded-full"
    />
  );
};

export default Logo;