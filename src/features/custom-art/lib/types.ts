/**
 * Types for the generative art system
 */

import type { Transaction } from '@/types';

/**
 * Configuration for the art generator
 */
export interface ArtGeneratorConfig {
  width: number;
  height: number;
  seed: number;
}

/**
 * Result from the art generation process
 */
export interface ArtGenerationResult {
  imageDataUrl: string;
  seed: number;
  generatedAt: Date;
}

/**
 * State of the art generation process
 */
export type ArtGenerationState = 'idle' | 'generating' | 'complete' | 'error';

/**
 * Interface that all art generators must implement
 * This allows for easy swapping of different art styles
 */
export interface ArtGenerator {
  generate(
    ctx: CanvasRenderingContext2D,
    config: ArtGeneratorConfig,
    transactions: Transaction[]
  ): void;
}

/**
 * Color palette used by generators
 */
export interface ColorPalette {
  sky: string[];
  stone: string[];
  accent: string;
  shadow: string;
}

/**
 * Building parameters derived from transaction data
 */
export interface BuildingParams {
  columnCount: number;
  columnStyle: 'doric' | 'ionic' | 'corinthian';
  stepCount: number;
  buildingScale: number;
  palette: ColorPalette;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  detailLevel: number;
}
