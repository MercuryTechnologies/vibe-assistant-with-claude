import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import type { FeatureCardsMetadata } from '@/chat/types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRightArrowLeft,
  faCreditCard,
  faChartLine,
  faBuildingColumns,
  faUsers,
  faPiggyBank,
  faFileInvoiceDollar,
  faFileInvoice,
  faIdCard,
  faArrowsRotate,
  faTags,
  faHandHoldingDollar,
  faChartSimple,
  faCode,
  faFileContract,
  faCheckDouble,
  faShieldCheck,
} from '@/icons';

// Icon mapping from string names to FontAwesome icons
const iconMap: Record<string, IconDefinition> = {
  'arrow-right-arrow-left': faArrowRightArrowLeft,
  'credit-card': faCreditCard,
  'chart-line': faChartLine,
  'building-columns': faBuildingColumns,
  'users': faUsers,
  'piggy-bank': faPiggyBank,
  'file-invoice-dollar': faFileInvoiceDollar,
  'file-invoice': faFileInvoice,
  'id-card': faIdCard,
  'arrows-rotate': faArrowsRotate,
  'tags': faTags,
  'hand-holding-dollar': faHandHoldingDollar,
  'chart-simple': faChartSimple,
  'code': faCode,
  'file-contract': faFileContract,
  'check-double': faCheckDouble,
  'shield-check': faShieldCheck,
};

// Color configurations for each theme
const colorConfig = {
  'purple-magic': {
    bg: 'var(--purple-magic-50)',
    accent: 'var(--purple-magic-500)',
    icon: 'var(--purple-magic-600)',
  },
  'green': {
    bg: 'var(--green-50)',
    accent: 'var(--green-500)',
    icon: 'var(--green-600)',
  },
  'neutral': {
    bg: 'var(--neutral-base-50)',
    accent: 'var(--neutral-base-500)',
    icon: 'var(--neutral-base-700)',
  },
};

interface FeatureCardsBlockProps {
  data: FeatureCardsMetadata;
  context?: 'rhc' | 'command';
  onNavigate?: (url: string) => void;
  animate?: boolean;  // Enable staggered "card deal" animation
  animationOffset?: number;  // Starting index offset for animation delays (for "more cards")
}

export function FeatureCardsBlock({ 
  data, 
  context = 'command', 
  onNavigate,
  animate = false,
  animationOffset = 0,
}: FeatureCardsBlockProps) {
  const handleCtaClick = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  // Grid columns: 1 for RHC (mobile), 2 for tablet, 3 for Command (desktop)
  // Using CSS media queries for true responsiveness
  const gridColumns = context === 'rhc' ? 1 : 3;

  return (
    <div
      className="feature-cards-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: context === 'rhc' ? 12 : 16,
        padding: context === 'rhc' ? '12px 0' : '16px 0',
        width: '100%',
        perspective: animate ? '1000px' : undefined,
      }}
    >
      {data.cards.map((card, index) => {
        const colors = colorConfig[card.color];
        const iconDef = iconMap[card.icon];
        const animationDelay = animate ? `${(index + animationOffset) * 120}ms` : undefined;

        return (
          <div
            key={card.id}
            className={`feature-card ${animate ? 'feature-card-animate' : ''}`}
            style={{
              backgroundColor: 'var(--ds-bg-default)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minHeight: 240,
              animationDelay,
            }}
          >
            {/* Header with icon and optional highlight badge */}
            <div className="flex items-start justify-between">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {iconDef ? (
                  <Icon icon={iconDef} style={{ color: colors.icon }} />
                ) : (
                  <span style={{ color: colors.icon, fontSize: 16 }}>●</span>
                )}
              </div>
              {card.highlight && (
                <span
                  className="text-tiny"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.accent,
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontWeight: 500,
                  }}
                >
                  {card.highlight}
                </span>
              )}
            </div>

            {/* Title and subtitle */}
            <div>
              <h3
                className="text-body-lg-demi"
                style={{ color: 'var(--ds-text-default)', margin: 0 }}
              >
                {card.title}
              </h3>
              <p
                className="text-body-sm"
                style={{ color: 'var(--ds-text-tertiary)', margin: 0 }}
              >
                {card.subtitle}
              </p>
            </div>

            {/* Description */}
            <p
              className="text-body-sm"
              style={{
                color: 'var(--ds-text-secondary)',
                margin: 0,
                lineHeight: 1.5,
                flex: 1,
              }}
            >
              {card.description}
            </p>

            {/* Stats */}
            <div className="flex gap-4">
              {card.stats.map((stat, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="text-tiny"
                    style={{ color: 'var(--ds-text-tertiary)' }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-body-sm-demi"
                    style={{ color: 'var(--ds-text-default)' }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <DSButton
              variant="secondary"
              size="small"
              onClick={() => handleCtaClick(card.cta.action)}
              style={{ width: '100%' }}
            >
              {card.cta.label}
            </DSButton>
          </div>
        );
      })}
    </div>
  );
}
