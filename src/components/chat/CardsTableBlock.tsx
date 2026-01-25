import { useState } from 'react';
import type { CardsTableMetadata, CardTableRow } from '@/chat/types';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import { Badge } from '@/components/ui/badge';
import { faSnowflake, faEye, faEyeSlash } from '@/icons';

interface CardsTableBlockProps {
  data: CardsTableMetadata;
  context?: 'rhc' | 'command';
  className?: string;
}

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Get badge variant based on card status
 */
function getStatusBadgeVariant(status: CardTableRow['status']): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'frozen':
      return 'warning';
    case 'cancelled':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/**
 * CardsTableBlock - Displays cards in chat with actions
 */
export function CardsTableBlock({ 
  data, 
  context = 'rhc',
  className = '' 
}: CardsTableBlockProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(data.showDetailFor || null);
  const [frozenCards, setFrozenCards] = useState<Set<string>>(new Set());
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  
  const isCompact = context === 'rhc';
  
  const handleToggleFreeze = (cardId: string, currentStatus: string) => {
    setFrozenCards(prev => {
      const next = new Set(prev);
      if (currentStatus === 'frozen' || next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };
  
  const handleToggleReveal = (cardId: string) => {
    setRevealedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };
  
  const getEffectiveStatus = (card: CardTableRow): string => {
    if (frozenCards.has(card.id)) return 'frozen';
    if (card.status === 'frozen' && !frozenCards.has(card.id)) {
      // Card was unfrozen in this session
      return 'active';
    }
    return card.status;
  };
  
  return (
    <div className={`chat-cards-table ${className}`} style={{ marginTop: 12 }}>
      {data.title && (
        <h4 className="text-label-demi" style={{ 
          color: 'var(--ds-text-default)', 
          marginBottom: 8 
        }}>
          {data.title}
        </h4>
      )}
      
      <table className="chat-table">
        <thead>
          <tr>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
              Cardholder
            </th>
            {!isCompact && (
              <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
                Card
              </th>
            )}
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)', textAlign: 'right' }}>
              Spent
            </th>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)', textAlign: 'right' }}>
              Limit
            </th>
            <th className="text-tiny" style={{ color: 'var(--ds-text-secondary)' }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((card) => {
            const isExpanded = expandedCardId === card.id;
            const effectiveStatus = getEffectiveStatus(card);
            const isRevealed = revealedCards.has(card.id);
            const isOverLimit = card.spent > card.limit;
            
            return (
              <>
                <tr 
                  key={card.id}
                  onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                  style={{ cursor: 'pointer' }}
                  className={isExpanded ? 'selected' : ''}
                >
                  <td>
                    <span className="text-body-sm" style={{ color: 'var(--ds-text-default)' }}>
                      {card.cardholder}
                    </span>
                    {isCompact && card.cardName && (
                      <span className="text-tiny" style={{ color: 'var(--ds-text-tertiary)', display: 'block' }}>
                        {card.cardName}
                      </span>
                    )}
                  </td>
                  {!isCompact && (
                    <td className="text-body-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                      •••• {card.cardLast4}
                    </td>
                  )}
                  <td 
                    className="text-body-sm"
                    style={{ 
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: isOverLimit ? 'var(--color-error)' : 'var(--ds-text-default)',
                    }}
                  >
                    {formatCurrency(card.spent)}
                  </td>
                  <td 
                    className="text-body-sm"
                    style={{ 
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--ds-text-secondary)',
                    }}
                  >
                    {formatCurrency(card.limit)}
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(effectiveStatus as CardTableRow['status'])}>
                      {effectiveStatus}
                    </Badge>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${card.id}-details`}>
                    <td colSpan={isCompact ? 4 : 5} style={{ padding: 12, backgroundColor: 'var(--ds-bg-secondary)' }}>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-label" style={{ color: 'var(--ds-text-secondary)' }}>
                            Card Number
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-body-sm" style={{ color: 'var(--ds-text-default)', fontVariantNumeric: 'tabular-nums' }}>
                              {isRevealed ? `4242 4242 4242 ${card.cardLast4}` : `•••• •••• •••• ${card.cardLast4}`}
                            </span>
                            <DSButton
                              variant="tertiary"
                              size="small"
                              iconOnly
                              aria-label={isRevealed ? 'Hide card number' : 'Show card number'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleReveal(card.id);
                              }}
                            >
                              <Icon icon={isRevealed ? faEyeSlash : faEye} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                            </DSButton>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <DSButton
                            variant={effectiveStatus === 'frozen' ? 'primary' : 'secondary'}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFreeze(card.id, effectiveStatus);
                            }}
                          >
                            <Icon icon={faSnowflake} size="small" />
                            {effectiveStatus === 'frozen' ? 'Unfreeze' : 'Freeze'}
                          </DSButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
