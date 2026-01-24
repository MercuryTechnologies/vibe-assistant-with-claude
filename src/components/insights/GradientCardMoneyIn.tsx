import React from 'react';

interface GradientCardMoneyInProps {
  width?: number;
  height?: number;
  topGradientColor?: string;
  bottomGradientColor?: string;
  topGlowColor?: string;
  bottomGlowColor?: string;
  topGlowOpacity?: number;
  bottomGlowOpacity?: number;
  topBlurIntensity?: number;
  bottomBlurIntensity?: number;
  topGlowSize?: number;
  bottomGlowSize?: number;
  topGlowOffset?: number;
  bottomGlowOffset?: number;
}

/**
 * GradientCardMoneyIn - A glassy card component for Money In bars
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
  const REF_WIDTH = 88;
  const REF_HEIGHT = 92;
  
  const scaleX = width / REF_WIDTH;
  const scaleY = height / REF_HEIGHT;
  
  const borderRadius = 8 * Math.min(scaleX, scaleY);
  
  const topBlurAmount = Math.max(50, 50 * scaleY * topBlurIntensity);
  const bottomBlurAmount = Math.max(50, 50 * scaleY * bottomBlurIntensity);
  
  const topEllipse = {
    cx: width / 2,
    cy: (height * 0.5) + topGlowOffset,
    rx: width * 0.8 * topGlowSize,
    ry: height * 0.5 * topGlowSize,
  };
  
  const bottomEllipse = {
    cx: width / 2,
    cy: (height * 0.85) + bottomGlowOffset,
    rx: width * 0.8 * bottomGlowSize,
    ry: height * 0.4 * bottomGlowSize,
  };
  
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
      
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={`url(#${gradientId})`}
        />
        
        <ellipse
          cx={topEllipse.cx}
          cy={topEllipse.cy}
          rx={topEllipse.rx}
          ry={topEllipse.ry}
          fill={topGlowColor}
          opacity={topGlowOpacity}
          filter={`url(#${topBlurFilterId})`}
        />
        
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
