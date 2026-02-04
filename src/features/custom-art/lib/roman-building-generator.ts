/**
 * Roman Building Generator
 * 
 * Creates procedural Roman temple/building artwork based on transaction data.
 * The building parameters are derived from transaction characteristics:
 * - Total amount → building scale
 * - Category distribution → color palette
 * - Transaction count → detail level
 * - Date spread → time of day (atmospheric effects)
 */

import type { Transaction } from '@/types';
import type { ArtGenerator, ArtGeneratorConfig, BuildingParams, ColorPalette } from './types';
import { createSeededRandom, randomInt, randomFloat, randomChoice, type SeededRandom } from './seeded-random';
import { transactionsToSeed, analyzeTransactions } from './transaction-seed';
import { createLinearGradient, drawRect, drawPolygon, drawEllipse } from './canvas-utils';

/**
 * Color palettes for different times of day
 */
const PALETTES: Record<BuildingParams['timeOfDay'], ColorPalette> = {
  dawn: {
    sky: ['#FF9A8B', '#FF6A88', '#FF99AC', '#FCB69F'],
    stone: ['#E8DCD0', '#D4C4B5', '#C9B8A8', '#BBA998'],
    accent: '#FFD700',
    shadow: 'rgba(139, 90, 43, 0.3)',
  },
  day: {
    sky: ['#87CEEB', '#98D8E8', '#B0E0E6', '#E0F4FF'],
    stone: ['#F5F0E8', '#E8E0D5', '#DDD5C8', '#D0C8BB'],
    accent: '#C9A961',
    shadow: 'rgba(100, 100, 120, 0.25)',
  },
  dusk: {
    sky: ['#2C3E50', '#8E44AD', '#E74C3C', '#F39C12'],
    stone: ['#D4C4B5', '#C9B8A8', '#BBA998', '#A89888'],
    accent: '#E67E22',
    shadow: 'rgba(50, 30, 20, 0.4)',
  },
  night: {
    sky: ['#0F0C29', '#302B63', '#24243E', '#1A1A2E'],
    stone: ['#8B8B9E', '#7A7A8E', '#69697E', '#58586E'],
    accent: '#E6E6FA',
    shadow: 'rgba(0, 0, 20, 0.5)',
  },
};

/**
 * Derive building parameters from transaction analysis
 */
function deriveBuildingParams(transactions: Transaction[], random: SeededRandom): BuildingParams {
  const analysis = analyzeTransactions(transactions);
  
  // Column count based on transaction count (4-8)
  const columnCount = Math.min(8, Math.max(4, Math.floor(analysis.transactionCount / 2) + 4));
  
  // Column style based on dominant category
  const categoryStyles: Record<string, BuildingParams['columnStyle']> = {
    'Software': 'ionic',
    'Payroll': 'corinthian',
    'Revenue': 'corinthian',
    'Marketing': 'ionic',
    'Office': 'doric',
    'Equipment': 'doric',
  };
  const columnStyle = categoryStyles[analysis.dominantCategory] || randomChoice(random, ['doric', 'ionic', 'corinthian']);
  
  // Step count (3-5)
  const stepCount = randomInt(random, 3, 5);
  
  // Building scale based on total amount (0.7-1.2)
  const amountScale = Math.min(1.2, Math.max(0.7, Math.log10(analysis.totalAmount + 1) / 5));
  const buildingScale = amountScale;
  
  // Time of day based on date spread
  let timeOfDay: BuildingParams['timeOfDay'];
  if (analysis.dateSpreadDays <= 1) {
    timeOfDay = 'day';
  } else if (analysis.dateSpreadDays <= 7) {
    timeOfDay = analysis.isNetPositive ? 'dawn' : 'dusk';
  } else if (analysis.dateSpreadDays <= 30) {
    timeOfDay = randomChoice(random, ['dawn', 'day', 'dusk']);
  } else {
    timeOfDay = randomChoice(random, ['dawn', 'day', 'dusk', 'night']);
  }
  
  const palette = PALETTES[timeOfDay];
  
  // Detail level (1-3) based on average amount
  const detailLevel = Math.min(3, Math.max(1, Math.floor(analysis.averageAmount / 5000) + 1));
  
  return {
    columnCount,
    columnStyle,
    stepCount,
    buildingScale,
    palette,
    timeOfDay,
    detailLevel,
  };
}

/**
 * Draw the sky gradient background
 */
function drawSky(ctx: CanvasRenderingContext2D, palette: ColorPalette): void {
  const { width, height } = ctx.canvas;
  
  const gradient = createLinearGradient(ctx, 0, 0, 0, height, [
    { offset: 0, color: palette.sky[0] },
    { offset: 0.3, color: palette.sky[1] },
    { offset: 0.6, color: palette.sky[2] },
    { offset: 1, color: palette.sky[3] },
  ]);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw decorative clouds
 */
function drawClouds(ctx: CanvasRenderingContext2D, random: SeededRandom, timeOfDay: BuildingParams['timeOfDay']): void {
  if (timeOfDay === 'night') return; // No visible clouds at night
  
  const { width } = ctx.canvas;
  const cloudCount = randomInt(random, 2, 5);
  
  ctx.fillStyle = timeOfDay === 'dusk' 
    ? 'rgba(255, 200, 150, 0.3)' 
    : 'rgba(255, 255, 255, 0.6)';
  
  for (let i = 0; i < cloudCount; i++) {
    const x = randomFloat(random, 50, width - 50);
    const y = randomFloat(random, 30, 120);
    const baseRadius = randomFloat(random, 20, 40);
    
    // Draw cloud as overlapping ellipses
    for (let j = 0; j < 4; j++) {
      const offsetX = randomFloat(random, -baseRadius, baseRadius);
      const offsetY = randomFloat(random, -baseRadius * 0.3, baseRadius * 0.3);
      const rx = randomFloat(random, baseRadius * 0.6, baseRadius * 1.2);
      const ry = randomFloat(random, baseRadius * 0.4, baseRadius * 0.7);
      
      drawEllipse(ctx, x + offsetX, y + offsetY, rx, ry, { fill: ctx.fillStyle as string });
    }
  }
}

/**
 * Draw the ground/floor area
 */
function drawGround(ctx: CanvasRenderingContext2D, palette: ColorPalette, groundY: number): void {
  const { width, height } = ctx.canvas;
  
  const gradient = createLinearGradient(ctx, 0, groundY, 0, height, [
    { offset: 0, color: palette.stone[2] },
    { offset: 1, color: palette.stone[3] },
  ]);
  
  drawRect(ctx, 0, groundY, width, height - groundY, { fill: gradient });
}

/**
 * Draw the temple steps/platform
 */
function drawSteps(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  totalWidth: number,
  stepCount: number,
  palette: ColorPalette
): number {
  const stepHeight = 12;
  const stepInset = 15;
  
  let currentY = y;
  let currentWidth = totalWidth;
  let currentX = x;
  
  for (let i = 0; i < stepCount; i++) {
    // Step top surface
    const gradient = createLinearGradient(ctx, currentX, currentY, currentX, currentY + stepHeight, [
      { offset: 0, color: palette.stone[0] },
      { offset: 1, color: palette.stone[1] },
    ]);
    
    drawRect(ctx, currentX, currentY, currentWidth, stepHeight, { fill: gradient });
    
    // Step shadow line
    ctx.fillStyle = palette.shadow;
    ctx.fillRect(currentX, currentY + stepHeight - 2, currentWidth, 2);
    
    currentY -= stepHeight;
    currentX += stepInset;
    currentWidth -= stepInset * 2;
  }
  
  return currentY + stepHeight; // Return the top of the platform
}

/**
 * Draw a single Doric column
 */
function drawDoricColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  width: number,
  palette: ColorPalette
): void {
  const height = bottomY - topY;
  const taperAmount = width * 0.1;
  
  // Column shaft with slight taper
  const points = [
    { x: x - width / 2 + taperAmount, y: topY },
    { x: x + width / 2 - taperAmount, y: topY },
    { x: x + width / 2, y: bottomY },
    { x: x - width / 2, y: bottomY },
  ];
  
  const gradient = createLinearGradient(ctx, x - width / 2, topY, x + width / 2, topY, [
    { offset: 0, color: palette.stone[1] },
    { offset: 0.3, color: palette.stone[0] },
    { offset: 0.7, color: palette.stone[0] },
    { offset: 1, color: palette.stone[2] },
  ]);
  
  drawPolygon(ctx, points, { fill: gradient });
  
  // Simple capital (square block)
  const capitalHeight = height * 0.06;
  const capitalWidth = width * 1.3;
  drawRect(ctx, x - capitalWidth / 2, topY - capitalHeight, capitalWidth, capitalHeight, {
    fill: palette.stone[0],
  });
  
  // Base
  const baseHeight = height * 0.04;
  const baseWidth = width * 1.2;
  drawRect(ctx, x - baseWidth / 2, bottomY, baseWidth, baseHeight, {
    fill: palette.stone[1],
  });
  
  // Fluting lines (vertical grooves)
  ctx.strokeStyle = palette.shadow;
  ctx.lineWidth = 1;
  const fluteCount = 5;
  for (let i = 1; i < fluteCount; i++) {
    const fluteX = x - width / 2 + (width / fluteCount) * i;
    ctx.beginPath();
    ctx.moveTo(fluteX + taperAmount * (i / fluteCount - 0.5), topY);
    ctx.lineTo(fluteX, bottomY);
    ctx.stroke();
  }
}

/**
 * Draw a single Ionic column (with scroll capitals)
 */
function drawIonicColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  width: number,
  palette: ColorPalette
): void {
  // Draw base column like Doric
  drawDoricColumn(ctx, x, topY, bottomY, width, palette);
  
  // Add volute (scroll) capitals
  const capitalY = topY - width * 0.06;
  const voluteRadius = width * 0.35;
  
  // Left volute
  ctx.beginPath();
  ctx.arc(x - width / 2 - voluteRadius * 0.3, capitalY, voluteRadius, 0, Math.PI, true);
  ctx.strokeStyle = palette.stone[2];
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Right volute
  ctx.beginPath();
  ctx.arc(x + width / 2 + voluteRadius * 0.3, capitalY, voluteRadius, 0, Math.PI, true);
  ctx.stroke();
}

/**
 * Draw a single Corinthian column (with ornate leaf capitals)
 */
function drawCorinthianColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  width: number,
  palette: ColorPalette,
  _random: SeededRandom
): void {
  // Draw base column
  drawDoricColumn(ctx, x, topY, bottomY, width, palette);
  
  // Ornate capital with leaf patterns
  const capitalHeight = width * 0.4;
  const capitalY = topY - width * 0.06;
  
  // Capital base
  const capitalGradient = createLinearGradient(ctx, x - width, capitalY - capitalHeight, x + width, capitalY, [
    { offset: 0, color: palette.stone[0] },
    { offset: 0.5, color: palette.stone[1] },
    { offset: 1, color: palette.stone[2] },
  ]);
  
  // Draw capital shape (bell-shaped)
  const capitalPoints = [
    { x: x - width * 0.6, y: capitalY },
    { x: x - width * 0.9, y: capitalY - capitalHeight },
    { x: x + width * 0.9, y: capitalY - capitalHeight },
    { x: x + width * 0.6, y: capitalY },
  ];
  drawPolygon(ctx, capitalPoints, { fill: capitalGradient });
  
  // Add decorative leaf shapes
  ctx.fillStyle = palette.accent;
  const leafCount = 3;
  for (let i = 0; i < leafCount; i++) {
    const leafX = x - width * 0.4 + (width * 0.8 / (leafCount - 1)) * i;
    const leafY = capitalY - capitalHeight * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(leafX, leafY + capitalHeight * 0.3);
    ctx.quadraticCurveTo(leafX - 5, leafY, leafX, leafY - capitalHeight * 0.2);
    ctx.quadraticCurveTo(leafX + 5, leafY, leafX, leafY + capitalHeight * 0.3);
    ctx.fill();
  }
}

/**
 * Draw the temple pediment (triangular top)
 */
function drawPediment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  palette: ColorPalette,
  detailLevel: number,
  _random: SeededRandom
): void {
  const height = width * 0.2;
  
  // Main triangle
  const points = [
    { x: x - width / 2, y },
    { x: x, y: y - height },
    { x: x + width / 2, y },
  ];
  
  const gradient = createLinearGradient(ctx, x, y - height, x, y, [
    { offset: 0, color: palette.stone[0] },
    { offset: 1, color: palette.stone[1] },
  ]);
  
  drawPolygon(ctx, points, { fill: gradient });
  
  // Border/frame
  ctx.strokeStyle = palette.stone[2];
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.lineTo(x, y - height);
  ctx.lineTo(x + width / 2, y);
  ctx.stroke();
  
  // Decorative elements based on detail level
  if (detailLevel >= 2) {
    // Central medallion/rosette
    drawEllipse(ctx, x, y - height * 0.5, height * 0.2, height * 0.2, {
      fill: palette.accent,
      stroke: palette.stone[2],
      lineWidth: 2,
    });
  }
  
  if (detailLevel >= 3) {
    // Additional corner acroteria (decorative elements)
    const acroteriaSize = height * 0.15;
    
    // Left corner
    drawEllipse(ctx, x - width / 2, y - acroteriaSize, acroteriaSize, acroteriaSize * 1.5, {
      fill: palette.stone[0],
    });
    
    // Right corner
    drawEllipse(ctx, x + width / 2, y - acroteriaSize, acroteriaSize, acroteriaSize * 1.5, {
      fill: palette.stone[0],
    });
    
    // Apex
    drawEllipse(ctx, x, y - height - acroteriaSize, acroteriaSize, acroteriaSize * 1.5, {
      fill: palette.stone[0],
    });
  }
}

/**
 * Draw the entablature (horizontal beam above columns)
 */
function drawEntablature(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  palette: ColorPalette,
  detailLevel: number
): number {
  const height = 40;
  
  // Main beam (architrave)
  drawRect(ctx, x - width / 2, y, width, height * 0.4, {
    fill: palette.stone[0],
  });
  
  // Frieze
  const friezeY = y - height * 0.4;
  drawRect(ctx, x - width / 2, friezeY, width, height * 0.35, {
    fill: palette.stone[1],
  });
  
  // Cornice (top molding)
  const corniceY = friezeY - height * 0.25;
  const corniceWidth = width * 1.05;
  drawRect(ctx, x - corniceWidth / 2, corniceY, corniceWidth, height * 0.25, {
    fill: palette.stone[0],
  });
  
  // Detail: triglyphs on frieze
  if (detailLevel >= 2) {
    const triglyphCount = Math.floor(width / 40);
    const spacing = width / triglyphCount;
    ctx.fillStyle = palette.shadow;
    
    for (let i = 0; i < triglyphCount; i++) {
      const tx = x - width / 2 + spacing * (i + 0.5);
      const tw = 15;
      const th = height * 0.3;
      
      // Three vertical lines
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(tx - tw / 2 + j * 6, friezeY + 5, 2, th - 10);
      }
    }
  }
  
  return corniceY;
}

/**
 * Main Roman Building Generator
 */
export const romanBuildingGenerator: ArtGenerator = {
  generate(
    ctx: CanvasRenderingContext2D,
    config: ArtGeneratorConfig,
    transactions: Transaction[]
  ): void {
    const { width, height, seed } = config;
    
    // Create seeded random from provided seed
    const random = createSeededRandom(seed);
    
    // Derive building parameters from transactions
    const params = deriveBuildingParams(transactions, random);
    const { columnCount, columnStyle, stepCount, buildingScale, palette, timeOfDay, detailLevel } = params;
    
    // Draw sky background
    drawSky(ctx, palette);
    
    // Draw clouds
    drawClouds(ctx, random, timeOfDay);
    
    // Calculate building dimensions
    const groundY = height * 0.75;
    const buildingWidth = width * 0.7 * buildingScale;
    const buildingCenterX = width / 2;
    
    // Draw ground
    drawGround(ctx, palette, groundY);
    
    // Draw steps and get platform top
    const platformTop = drawSteps(ctx, buildingCenterX - buildingWidth / 2, groundY, buildingWidth, stepCount, palette);
    
    // Calculate column dimensions
    const columnAreaWidth = buildingWidth * 0.85;
    const columnSpacing = columnAreaWidth / (columnCount - 1);
    const columnWidth = columnSpacing * 0.35;
    const columnHeight = height * 0.35 * buildingScale;
    const columnTopY = platformTop - columnHeight;
    
    // Draw entablature (above columns)
    const entablatureTop = drawEntablature(ctx, buildingCenterX, columnTopY, columnAreaWidth * 1.1, palette, detailLevel);
    
    // Draw pediment (triangular top)
    drawPediment(ctx, buildingCenterX, entablatureTop, columnAreaWidth * 1.15, palette, detailLevel, random);
    
    // Draw columns
    const columnStartX = buildingCenterX - columnAreaWidth / 2;
    
    for (let i = 0; i < columnCount; i++) {
      const colX = columnStartX + columnSpacing * i;
      
      switch (columnStyle) {
        case 'ionic':
          drawIonicColumn(ctx, colX, columnTopY, platformTop, columnWidth, palette);
          break;
        case 'corinthian':
          drawCorinthianColumn(ctx, colX, columnTopY, platformTop, columnWidth, palette, random);
          break;
        case 'doric':
        default:
          drawDoricColumn(ctx, colX, columnTopY, platformTop, columnWidth, palette);
          break;
      }
    }
    
    // Add signature/watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arcadia, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Mercury Custom Art', width - 15, height - 15);
  },
};

/**
 * Generate art and return as data URL
 */
export async function generateRomanBuilding(
  canvas: HTMLCanvasElement,
  transactions: Transaction[]
): Promise<string> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  const seed = transactionsToSeed(transactions);
  
  const config: ArtGeneratorConfig = {
    width: canvas.width,
    height: canvas.height,
    seed,
  };
  
  // Simulate async generation for future API compatibility
  await new Promise(resolve => setTimeout(resolve, 100));
  
  romanBuildingGenerator.generate(ctx, config, transactions);
  
  return canvas.toDataURL('image/png');
}
