import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40 }) => {
  return (
    <img
      src="/SLA.png"
      alt="Sierra Leone Aquatics Logo"
      width={size}
      height={size}
      decoding="async"
      style={{
        width: size,
        height: size,
      }}
      className="rounded-full object-contain"
    />
  );
};

export default Logo;
