/**
 * CustomArtModal - Modal for displaying and interacting with generated art
 */

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DSButton } from '@/components/ui/ds-button';
import { Icon } from '@/components/ui/icon';
import { faDownload, faRotateRight } from '@/icons';
import type { Transaction } from '@/types';
import { useCustomArt } from './useCustomArt';

export interface CustomArtModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Handler when modal is closed */
  onClose: () => void;
  /** Transactions to use for art generation */
  transactions: Transaction[];
}

export function CustomArtModal({ open, onClose, transactions }: CustomArtModalProps) {
  const {
    state,
    imageDataUrl,
    error,
    generate,
    regenerate,
    download,
    reset,
    canRegenerate,
    transactionOffset,
  } = useCustomArt(transactions);

  // Generate art when modal opens
  useEffect(() => {
    if (open && state === 'idle') {
      generate();
    }
  }, [open, state, generate]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Small delay to let close animation finish
      const timer = setTimeout(() => {
        reset();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, reset]);

  const handleRegenerate = async () => {
    await regenerate();
  };

  const isGenerating = state === 'generating';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="custom-art-modal-content" showCloseButton>
        <DialogHeader>
          <DialogTitle>Your Custom Mercury Art</DialogTitle>
          <DialogDescription>
            Generated from your {transactionOffset === 0 ? 'most recent' : 'next'} 10 transactions
          </DialogDescription>
        </DialogHeader>

        <div className="custom-art-canvas-container">
          {isGenerating && (
            <div className="custom-art-loading">
              <div className="custom-art-loading-spinner">
                <div className="custom-art-loading-dot" />
                <div className="custom-art-loading-dot" />
                <div className="custom-art-loading-dot" />
              </div>
              <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                Generating your unique artwork...
              </span>
            </div>
          )}

          {state === 'error' && (
            <div className="custom-art-error">
              <span className="text-body" style={{ color: 'var(--ds-text-error)' }}>
                {error || 'Failed to generate art. Please try again.'}
              </span>
              <DSButton variant="secondary" size="small" onClick={generate}>
                Try Again
              </DSButton>
            </div>
          )}

          {state === 'complete' && imageDataUrl && (
            <div className="custom-art-image-wrapper">
              <img
                src={imageDataUrl}
                alt="Generated Mercury custom art depicting a Roman building"
                className="custom-art-image"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <DSButton
            variant="tertiary"
            size="small"
            onClick={handleRegenerate}
            disabled={isGenerating}
            leadingIcon={<Icon icon={faRotateRight} size="small" />}
          >
            {canRegenerate ? 'Regenerate (Next 10)' : 'Regenerate'}
          </DSButton>
          <DSButton
            variant="secondary"
            size="small"
            onClick={download}
            disabled={isGenerating || state !== 'complete'}
            leadingIcon={<Icon icon={faDownload} size="small" />}
          >
            Download
          </DSButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
