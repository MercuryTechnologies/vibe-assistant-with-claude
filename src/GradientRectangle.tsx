import React from 'react';

interface GradientBarProps {
  height: number;
  width?: number;
}

const GradientBar: React.FC<GradientBarProps> = ({ height, width = 100 }) => {
  // Scale gradient sizes based on height (200px is our reference height)
  const heightRatio = height / 200;
  const pinkGradientSize = Math.max(30, 69 * heightRatio);
  const blueGradientSize = Math.max(30, 67 * heightRatio);
  const blurAmount = 40; // Fixed blur amount, not scaled
  
  // Position gradients relative to bar height
  const pinkTop = -35 * heightRatio;
  const blueTop = (height * 0.20) - (10 * heightRatio); // Moved up by 5% and scaled
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#383255',
        borderRadius: '8px',
      }}
    >
      {/* Pink gradient ellipse */}
      <div 
        className="absolute"
        style={{
          width: `${pinkGradientSize}px`,
          height: `${pinkGradientSize}px`,
          background: `radial-gradient(ellipse ${pinkGradientSize}px ${pinkGradientSize}px, rgba(255, 105, 180, 0.85) 0%, transparent 60%)`,
          filter: `blur(${blurAmount}px)`,
          left: `${width * 0.08}px`,
          top: `${pinkTop}px`,
          transform: 'scaleY(-1)',
        }}
      />
      
      {/* Blue gradient ellipse */}
      <div 
        className="absolute"
        style={{
          width: `${blueGradientSize}px`,
          height: `${blueGradientSize}px`,
          background: `radial-gradient(ellipse ${blueGradientSize}px ${blueGradientSize}px, rgba(59, 130, 246, 0.9) 0%, transparent 60%)`,
          filter: `blur(${blurAmount}px)`,
          left: `${width * 0.09}px`,
          top: `${blueTop}px`,
          transform: 'scaleY(-1)',
        }}
      />
    </div>
  );
};

const GradientRectangle: React.FC = () => {
  // Different heights for the bars
  const barHeights = [200, 150, 120, 180, 90];
  
  return (
    <div className="flex justify-center items-end gap-4 mt-8">
      {barHeights.map((height, index) => (
        <GradientBar key={index} height={height} />
      ))}
    </div>
  );
};

export default GradientRectangle;
