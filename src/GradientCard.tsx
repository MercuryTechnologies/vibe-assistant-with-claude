import React from 'react';

interface GradientCardProps {
  /** Width of the card in pixels (default: 87) */
  width?: number;
  /** Height of the card in pixels (default: 135) */
  height?: number;
  /** Base background color (default: #383255 - deep indigo) */
  baseColor?: string;
  /** Top glow color (default: #FC92B4 - soft pink) */
  topGlowColor?: string;
  /** Bottom glow color (default: #335C6B - muted teal) */
  bottomGlowColor?: string;
  /** Top glow opacity (default: 0.85) */
  topGlowOpacity?: number;
  /** Bottom glow opacity (default: 1.0) */
  bottomGlowOpacity?: number;
  /** Blur intensity multiplier (default: 1.0) - DEPRECATED, use topBlurIntensity and bottomBlurIntensity */
  blurIntensity?: number;
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
 * GradientCard - A glassy card component with mesh gradient effect
 * 
 * Reproduces a Figma design featuring:
 * - Rounded rectangle base with smooth gradient
 * - Two layered blurred ellipses creating a "mesh gradient" effect
 * - Scales proportionally while maintaining visual fidelity
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
  // Use individual blur intensities if provided, otherwise fall back to shared blurIntensity
  const effectiveTopBlur = topBlurIntensity ?? blurIntensity;
  const effectiveBottomBlur = bottomBlurIntensity ?? blurIntensity;
  // Reference dimensions from Figma (87×135)
  const REF_WIDTH = 87;
  const REF_HEIGHT = 135;
  
  // Calculate scaling factors
  const scaleX = width / REF_WIDTH;
  const scaleY = height / REF_HEIGHT;
  
  // Border radius: 8px scaled proportionally
  const borderRadius = 8 * Math.min(scaleX, scaleY);
  
  // Blur amounts: Increased significantly to create smooth mesh gradient effect
  // For narrow bars, use a higher minimum to ensure soft blending
  const topBlurAmount = Math.max(40, 40.3 * scaleY * effectiveTopBlur);
  const bottomBlurAmount = Math.max(40, 40.3 * scaleY * effectiveBottomBlur);
  
  // Top ellipse (pink glow near top)
  // Made much larger to fill the bar and create seamless blending
  const topEllipse = {
    cx: width / 2,  // Center horizontally in the bar
    cy: (height * 0.3) + topGlowOffset,   // Position in upper third + offset
    rx: width * 0.8 * topGlowSize,  // Large horizontal radius (80% of bar width)
    ry: height * 0.6 * topGlowSize,   // Large vertical radius (60% of bar height)
  };
  
  // Bottom ellipse (teal glow in lower half)
  // Made much larger to fill the bar and create seamless blending
  const bottomEllipse = {
    cx: width / 2,   // Center horizontally in the bar
    cy: (height * 0.7) + bottomGlowOffset,   // Position in lower third + offset
    rx: width * 0.8 * bottomGlowSize,  // Large horizontal radius (80% of bar width)
    ry: height * 0.6 * bottomGlowSize,   // Large vertical radius (60% of bar height)
  };
  
  // Unique IDs for this instance (in case multiple cards are rendered)
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
        {/* 
          TOP GLOW BLUR FILTER
          Uses Gaussian blur with stdDeviation to create soft glow effect for pink ellipse.
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
          Uses Gaussian blur with stdDeviation to create soft glow effect for teal ellipse.
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
          Ensures glows don't spill outside the card boundaries.
          Only rounds the bottom corners (top corners are square in Figma).
        */}
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
      
      {/* Main group with clipping applied */}
      <g clipPath={`url(#${clipId})`}>
        {/* 
          BASE RECTANGLE
          The foundational layer with deep indigo color.
          Covers entire card area.
        */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={baseColor}
        />
        
        {/* 
          TOP GLOW (Pink ellipse)
          Positioned near the top of the card.
          Creates warm accent that bleeds down from above.
          Higher opacity (85%) for increased vibrancy.
          Independent blur and size controls.
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
          BOTTOM GLOW (Teal ellipse)
          Positioned in the lower half of the card.
          Creates depth and cool accent.
          Full opacity for stronger presence.
          Independent blur and size controls.
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

export default GradientCard;

