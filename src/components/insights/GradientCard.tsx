import React from 'react';

interface GradientCardProps {
  width?: number;
  height?: number;
  baseColor?: string;
  topGlowColor?: string;
  bottomGlowColor?: string;
  topGlowOpacity?: number;
  bottomGlowOpacity?: number;
  blurIntensity?: number;
  topBlurIntensity?: number;
  bottomBlurIntensity?: number;
  topGlowSize?: number;
  bottomGlowSize?: number;
  topGlowOffset?: number;
  bottomGlowOffset?: number;
}

/**
 * GradientCard - A glassy card component with mesh gradient effect for Money Out bars
 */
const GradientCard: React.FC<GradientCardProps> = ({
  width = 87,
  height = 135,
  baseColor = '#383255',
  topGlowColor = '#FC92B4',
  bottomGlowColor = '#335C6B',
  topGlowOpacity = 0.85,
  bottomGlowOpacity = 1.0,
  blurIntensity = 1.0,
  topBlurIntensity,
  bottomBlurIntensity,
  topGlowSize = 1.0,
  bottomGlowSize = 1.0,
  topGlowOffset = 0,
  bottomGlowOffset = 0,
}) => {
  const effectiveTopBlur = topBlurIntensity ?? blurIntensity;
  const effectiveBottomBlur = bottomBlurIntensity ?? blurIntensity;
  
  const REF_WIDTH = 87;
  const REF_HEIGHT = 135;
  
  const scaleX = width / REF_WIDTH;
  const scaleY = height / REF_HEIGHT;
  
  const borderRadius = 8 * Math.min(scaleX, scaleY);
  
  const topBlurAmount = Math.max(40, 40.3 * scaleY * effectiveTopBlur);
  const bottomBlurAmount = Math.max(40, 40.3 * scaleY * effectiveBottomBlur);
  
  const topEllipse = {
    cx: width / 2,
    cy: (height * 0.3) + topGlowOffset,
    rx: width * 0.8 * topGlowSize,
    ry: height * 0.6 * topGlowSize,
  };
  
  const bottomEllipse = {
    cx: width / 2,
    cy: (height * 0.7) + bottomGlowOffset,
    rx: width * 0.8 * bottomGlowSize,
    ry: height * 0.6 * bottomGlowSize,
  };
  
  const instanceId = React.useId();
  const clipId = `clip-${instanceId}`;
  const topBlurFilterId = `blur-top-${instanceId}`;
  const bottomBlurFilterId = `blur-bottom-${instanceId}`;
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
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
              M 0 0 
              H ${width} 
              V ${height - borderRadius}
              Q ${width} ${height} ${width - borderRadius} ${height}
              H ${borderRadius}
              Q 0 ${height} 0 ${height - borderRadius}
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
          fill={baseColor}
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

export default GradientCard;
