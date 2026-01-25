import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { faArrowRight } from '@/icons';
import { DSButton } from '@/components/ui/ds-button';
import type { NavigationMetadata } from '@/chat/types';

interface NavigationCardProps {
  navigation: NavigationMetadata;
  onNavigate: (url: string) => void;
  className?: string;
}

/**
 * NavigationCard - Card that navigates to a page in the app
 * Optionally shows a countdown before auto-navigating
 */
export function NavigationCard({ 
  navigation, 
  onNavigate,
  className = '' 
}: NavigationCardProps) {
  const [countdown, setCountdown] = useState(navigation.countdown ? 3 : 0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (navigation.countdown && countdown === 0) {
      onNavigate(navigation.url);
    }
  }, [countdown, navigation.countdown, navigation.url, onNavigate]);

  return (
    <div className={`chat-navigation-card ${className}`}>
      <div className="chat-navigation-card-content">
        <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
          Taking you to {navigation.target}
          {countdown > 0 && <span className="chat-navigation-countdown">...{countdown}</span>}
        </span>
      </div>
      <DSButton
        variant="tertiary"
        size="small"
        onClick={() => onNavigate(navigation.url)}
      >
        Go now
        <Icon icon={faArrowRight} size="small" style={{ color: 'var(--ds-icon-primary)' }} />
      </DSButton>
    </div>
  );
}
