import React from 'react';

interface GradientCardMoneyInProps {
  /** Width of the card in pixels (default: 88) */
  width?: number;
  /** Height of the card in pixels (default: 92) */
  height?: number;
  /** Top gradient color (default: #D1E1E8 - light blue-gray) */
  topGradientColor?: string;
  /** Bottom gradient color (default: #C3C0DF - light purple) */
  bottomGradientColor?: string;
  /** Top glow color (default: #9CB4E8 - blue) */
  topGlowColor?: string;
  /** Bottom glow color (default: #77C599 - green) */
  bottomGlowColor?: string;
  /** Top glow opacity (default: 1.0) */
  topGlowOpacity?: number;
  /** Bottom glow opacity (default: 1.0) */
  bottomGlowOpacity?: number;
  /** Top glow blur intensity multiplier (default: 1.0) */
  topBlurIntensity?: number;
  /** Bottom glow blur intensity multiplier (default: 1.0) */
  bottomBlurIntensity?: number;
  /** Top ellipse size multiplier (default: 1.0) */
  topGlowSize?: number;
  /** Bottom ellipse size multiplier (default: 1.0) */
  bottomGlowSize?: number;
  /** Top ellipse vertical position offset (default: 0) */
  topGlowOffset?: number;
  /** Bottom ellipse vertical position offset (default: 0) */
  bottomGlowOffset?: number;
}

/**
 * GradientCardMoneyIn - A glassy card component for Money In bars
 * 
 * Features:
 * - Linear gradient background from top to bottom
 * - Two layered blurred ellipses creating a soft glow effect
 * - Scales proportionally while maintaining visual fidelity
 */
const GradientCardMoneyIn: React.FC<GradientCardMoneyInProps> = ({
  width = 88,
  height = 92,
  topGradientColor = '#D1E1E8',
  bottomGradientColor = '#C3C0DF',
  topGlowColor = '#9CB4E8',
  bottomGlowColor = '#77C599',
  topGlowOpacity = 1.0,
  bottomGlowOpacity = 1.0,
  topBlurIntensity = 1.0,
  bottomBlurIntensity = 1.0,
  topGlowSize = 1.0,
  bottomGlowSize = 1.0,
  topGlowOffset = 0,
  bottomGlowOffset = 0,
}) => {
  // Reference dimensions from Figma (88×92)
  const REF_WIDTH = 88;
  const REF_HEIGHT = 92;
  
  // Calculate scaling factors
  const scaleX = width / REF_WIDTH;
  const scaleY = height / REF_HEIGHT;
  
  // Border radius: 8px at top scaled proportionally
  const borderRadius = 8 * Math.min(scaleX, scaleY);
  
  // Blur amounts: Increased significantly to create smooth mesh gradient effect
  // For narrow bars, use a higher minimum to ensure soft blending
  const topBlurAmount = Math.max(50, 50 * scaleY * topBlurIntensity);
  const bottomBlurAmount = Math.max(50, 50 * scaleY * bottomBlurIntensity);
  
  // Top ellipse (blue glow in middle area)
  // Made much larger to fill the bar and create seamless blending
  const topEllipse = {
    cx: width / 2,  // Center horizontally in the bar
    cy: (height * 0.5) + topGlowOffset,  // Position in middle + offset
    rx: width * 0.8 * topGlowSize,  // Large horizontal radius (80% of bar width)
    ry: height * 0.5 * topGlowSize,  // Large vertical radius (50% of bar height)
  };
  
  // Bottom ellipse (green glow near bottom)
  // Made much larger to fill the bar and create seamless blending
  const bottomEllipse = {
    cx: width / 2,  // Center horizontally in the bar
    cy: (height * 0.85) + bottomGlowOffset,  // Position near bottom + offset
    rx: width * 0.8 * bottomGlowSize,  // Large horizontal radius (80% of bar width)
    ry: height * 0.4 * bottomGlowSize,  // Large vertical radius (40% of bar height)
  };
  
  // Unique IDs for this instance
  const instanceId = React.useId();
  const clipId = `clip-money-in-${instanceId}`;
  const topBlurFilterId = `blur-top-money-in-${instanceId}`;
  const bottomBlurFilterId = `blur-bottom-money-in-${instanceId}`;
  const gradientId = `gradient-money-in-${instanceId}`;
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 
          LINEAR GRADIENT
          Flows from top (light blue-gray) to bottom (light purple)
        */}
        <linearGradient
          id={gradientId}
          x1={width / 2}
          y1="0"
          x2={width / 2}
          y2={height}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={topGradientColor} />
          <stop offset="100%" stopColor={bottomGradientColor} />
        </linearGradient>
        
        {/* 
          TOP GLOW BLUR FILTER
          Uses Gaussian blur to create soft glow effect for blue ellipse.
        */}
        <filter
          id={topBlurFilterId}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={topBlurAmount} in="SourceGraphic" />
        </filter>
        
        {/* 
          BOTTOM GLOW BLUR FILTER
          Uses Gaussian blur to create soft glow effect for green ellipse.
        */}
        <filter
          id={bottomBlurFilterId}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={bottomBlurAmount} in="SourceGraphic" />
        </filter>
        
        {/* 
          CLIPPING PATH
          Defines the rounded rectangle shape that clips the card.
          Rounds only the top corners (bottom corners are square).
        */}
        <clipPath id={clipId}>
          <path
            d={`
              M 0 ${borderRadius}
              Q 0 0 ${borderRadius} 0
              H ${width - borderRadius}
              Q ${width} 0 ${width} ${borderRadius}
              V ${height}
              H 0
              Z
            `}
          />
        </clipPath>
      </defs>
      
      {/* Main group with clipping applied */}
      <g clipPath={`url(#${clipId})`}>
        {/* 
          BASE RECTANGLE WITH LINEAR GRADIENT
          The foundational layer with gradient from light blue-gray to light purple.
          Covers entire card area.
        */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={`url(#${gradientId})`}
        />
        
        {/* 
          TOP GLOW (Blue ellipse)
          Positioned in the middle-lower area of the card.
          Creates soft blue accent.
        */}
        <ellipse
          cx={topEllipse.cx}
          cy={topEllipse.cy}
          rx={topEllipse.rx}
          ry={topEllipse.ry}
          fill={topGlowColor}
          opacity={topGlowOpacity}
          filter={`url(#${topBlurFilterId})`}
        />
        
        {/* 
          BOTTOM GLOW (Green ellipse)
          Positioned near the bottom of the card.
          Creates warmth and depth.
        */}
        <ellipse
          cx={bottomEllipse.cx}
          cy={bottomEllipse.cy}
          rx={bottomEllipse.rx}
          ry={bottomEllipse.ry}
          fill={bottomGlowColor}
          opacity={bottomGlowOpacity}
          filter={`url(#${bottomBlurFilterId})`}
        />
      </g>
    </svg>
  );
};

export default GradientCardMoneyIn;

