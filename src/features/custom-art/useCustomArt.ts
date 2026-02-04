/**
 * Hook for managing custom art generation state
 */

import { useState, useCallback, useRef } from 'react';
import type { Transaction } from '@/types';
import { generateRomanBuilding, downloadCanvas, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './lib';
import type { ArtGenerationState } from './lib';

export interface UseCustomArtOptions {
  /** Number of transactions to use per generation */
  transactionCount?: number;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
}

export interface UseCustomArtReturn {
  /** Current state of art generation */
  state: ArtGenerationState;
  /** Generated image as data URL */
  imageDataUrl: string | null;
  /** Error message if generation failed */
  error: string | null;
  /** Reference to the canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Start generating art */
  generate: () => Promise<void>;
  /** Regenerate with next set of transactions */
  regenerate: () => Promise<void>;
  /** Download the generated image */
  download: () => void;
  /** Reset state to idle */
  reset: () => void;
  /** Current transaction offset (for regeneration) */
  transactionOffset: number;
  /** Whether more transactions are available for regeneration */
  canRegenerate: boolean;
}

const TRANSACTION_BATCH_SIZE = 10;

export function useCustomArt(
  transactions: Transaction[],
  options: UseCustomArtOptions = {}
): UseCustomArtReturn {
  const {
    transactionCount = TRANSACTION_BATCH_SIZE,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
  } = options;

  const [state, setState] = useState<ArtGenerationState>('idle');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionOffset, setTransactionOffset] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sort transactions by date descending (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Check if we can regenerate (have more transactions)
  const canRegenerate = transactionOffset + transactionCount < sortedTransactions.length;

  /**
   * Get the current batch of transactions based on offset
   */
  const getCurrentBatch = useCallback((offset: number): Transaction[] => {
    return sortedTransactions.slice(offset, offset + transactionCount);
  }, [sortedTransactions, transactionCount]);

  /**
   * Generate art with the current transaction batch
   */
  const generateWithOffset = useCallback(async (offset: number): Promise<void> => {
    setState('generating');
    setError(null);

    try {
      // Get or create canvas
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      canvas.width = width;
      canvas.height = height;

      // Get transaction batch
      const batch = getCurrentBatch(offset);
      
      if (batch.length === 0) {
        throw new Error('No transactions available for art generation');
      }

      // Add artificial delay for better UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generate the art
      const dataUrl = await generateRomanBuilding(canvas, batch);
      
      setImageDataUrl(dataUrl);
      setState('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate art';
      setError(message);
      setState('error');
    }
  }, [width, height, getCurrentBatch]);

  /**
   * Start generating art with the first batch
   */
  const generate = useCallback(async (): Promise<void> => {
    setTransactionOffset(0);
    await generateWithOffset(0);
  }, [generateWithOffset]);

  /**
   * Regenerate with the next batch of transactions
   */
  const regenerate = useCallback(async (): Promise<void> => {
    const newOffset = transactionOffset + transactionCount;
    
    if (newOffset >= sortedTransactions.length) {
      // Wrap around if we've used all transactions
      setTransactionOffset(0);
      await generateWithOffset(0);
    } else {
      setTransactionOffset(newOffset);
      await generateWithOffset(newOffset);
    }
  }, [transactionOffset, transactionCount, sortedTransactions.length, generateWithOffset]);

  /**
   * Download the generated image
   */
  const download = useCallback((): void => {
    if (!canvasRef.current || !imageDataUrl) {
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCanvas(canvasRef.current, `mercury-custom-art-${timestamp}.png`);
  }, [imageDataUrl]);

  /**
   * Reset state to idle
   */
  const reset = useCallback((): void => {
    setState('idle');
    setImageDataUrl(null);
    setError(null);
    setTransactionOffset(0);
  }, []);

  return {
    state,
    imageDataUrl,
    error,
    canvasRef,
    generate,
    regenerate,
    download,
    reset,
    transactionOffset,
    canRegenerate,
  };
}
