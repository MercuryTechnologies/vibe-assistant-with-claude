/**
 * CustomArtBanner - Promotional banner for the limited-time Custom Art feature
 */

import { DSButton } from '@/components/ui/ds-button';
import { Icon } from '@/components/ui/icon';
import { faPalette, faXmark } from '@/icons';

export interface CustomArtBannerProps {
  /** Handler when CTA button is clicked */
  onGetArt: () => void;
  /** Handler when banner is dismissed */
  onDismiss: () => void;
  /** Whether the banner is visible */
  visible: boolean;
}

export function CustomArtBanner({ onGetArt, onDismiss, visible }: CustomArtBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="custom-art-banner">
      <div className="custom-art-banner-content">
        <div className="custom-art-banner-icon">
          <Icon icon={faPalette} style={{ color: 'var(--purple-magic-600)' }} />
        </div>
        <div className="custom-art-banner-text">
          <h3 className="text-body-demi m-0" style={{ color: 'var(--ds-text-default)' }}>
            Custom Art for Mercury Customers
          </h3>
          <p className="text-body-sm m-0" style={{ color: 'var(--ds-text-secondary)' }}>
            Limited time only! Generate unique artwork based on your recent transactions.
          </p>
        </div>
        <div className="custom-art-banner-actions">
          <DSButton variant="primary" size="small" onClick={onGetArt}>
            Get Your Art
          </DSButton>
        </div>
      </div>
      <button
        className="custom-art-banner-close"
        onClick={onDismiss}
        aria-label="Dismiss banner"
      >
        <Icon icon={faXmark} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
      </button>
    </div>
  );
}
