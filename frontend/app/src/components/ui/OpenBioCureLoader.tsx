import React from 'react';

interface OpenBioCureLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullPage?: boolean;
}

const OpenBioCureLoader: React.FC<OpenBioCureLoaderProps> = ({ 
  size = 'md', 
  className = '',
  fullPage = false 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const logoSize = sizeClasses[size];

  const loader = (
    <div className={`relative ${logoSize} ${className}`}>
      {/* Glowing circular border */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00239C] to-[#00A3E0] opacity-20 animate-spin-slow"></div>
      
      {/* Main logo container with rotation */}
      <div className="relative w-full h-full animate-rotate-slow">
        {/* Logo image */}
        <img
          src="/logo512.png"
          alt="OpenBioCure"
          className="w-full h-full object-contain"
        />
        
        {/* Circuit line overlays for animation */}
        <div className="absolute inset-0">
          {/* Circuit line 1 - Top right */}
          <div className="absolute top-2 right-2 w-3 h-1 bg-[#E76900] rounded-full animate-pulse-circuit-1"></div>
          
          {/* Circuit line 2 - Middle right */}
          <div className="absolute top-1/2 right-1 w-2 h-1 bg-[#E76900] rounded-full animate-pulse-circuit-2"></div>
          
          {/* Circuit line 3 - Bottom right */}
          <div className="absolute bottom-2 right-2 w-3 h-1 bg-[#E76900] rounded-full animate-pulse-circuit-3"></div>
          
          {/* Circuit line 4 - Far right */}
          <div className="absolute top-1/3 right-0 w-1 h-1 bg-[#E76900] rounded-full animate-pulse-circuit-4"></div>
          
          {/* Circuit line 5 - Upper right */}
          <div className="absolute top-1/4 right-1 w-2 h-1 bg-[#E76900] rounded-full animate-pulse-circuit-5"></div>
        </div>
      </div>
      
      {/* Glowing effect around the logo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00239C] to-[#00A3E0] opacity-10 blur-xl animate-pulse"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          {loader}
          <div className="mt-6 flex flex-col items-center">
            <div className="text-lg font-semibold text-[#00239C] mb-2">
              Loading OpenBioCure Platform
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-[#00239C] to-[#00A3E0] rounded-full overflow-hidden">
              <div className="h-full bg-[#E76900] rounded-full animate-progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return loader;
};

export default OpenBioCureLoader;
