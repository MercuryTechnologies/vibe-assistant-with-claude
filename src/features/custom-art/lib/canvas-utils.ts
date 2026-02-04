/**
 * Canvas utility functions for the generative art system
 */

/**
 * Default canvas dimensions
 */
export const DEFAULT_WIDTH = 800;
export const DEFAULT_HEIGHT = 600;

/**
 * Creates an offscreen canvas for rendering
 */
export function createCanvas(width: number = DEFAULT_WIDTH, height: number = DEFAULT_HEIGHT): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Get 2D rendering context with default settings
 */
export function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  return ctx;
}

/**
 * Clear the canvas with a solid color
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, color: string = '#ffffff'): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Create a linear gradient
 */
export function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colorStops: Array<{ offset: number; color: string }>
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const stop of colorStops) {
    gradient.addColorStop(stop.offset, stop.color);
  }
  return gradient;
}

/**
 * Draw a rectangle with optional rounded corners
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fill?: string | CanvasGradient;
    stroke?: string;
    lineWidth?: number;
    radius?: number;
  } = {}
): void {
  const { fill, stroke, lineWidth = 1, radius = 0 } = options;

  ctx.beginPath();
  if (radius > 0) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Draw a line
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  options: {
    color?: string;
    lineWidth?: number;
    lineCap?: CanvasLineCap;
  } = {}
): void {
  const { color = '#000000', lineWidth = 1, lineCap = 'butt' } = options;

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = lineCap;
  ctx.stroke();
}

/**
 * Draw a polygon from an array of points
 */
export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  options: {
    fill?: string | CanvasGradient;
    stroke?: string;
    lineWidth?: number;
  } = {}
): void {
  if (points.length < 3) return;

  const { fill, stroke, lineWidth = 1 } = options;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Draw an ellipse
 */
export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  options: {
    fill?: string | CanvasGradient;
    stroke?: string;
    lineWidth?: number;
  } = {}
): void {
  const { fill, stroke, lineWidth = 1 } = options;

  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Convert canvas to data URL for download
 */
export function canvasToDataUrl(canvas: HTMLCanvasElement, type: string = 'image/png', quality: number = 1): string {
  return canvas.toDataURL(type, quality);
}

/**
 * Trigger download of canvas as image
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'mercury-custom-art.png'): void {
  const dataUrl = canvasToDataUrl(canvas);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
