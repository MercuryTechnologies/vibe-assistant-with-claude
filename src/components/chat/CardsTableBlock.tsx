import { useState } from 'react';
import type { CardsTableMetadata, CardTableRow } from '@/chat/types';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import { DSTextInput } from '@/components/ui/ds-text-input';
import { Badge } from '@/components/ui/badge';
import { faSnowflake, faEye, faEyeSlash, faPencil, faCheck, faXmark, faChevronDown } from '@/icons';

interface CardsTableBlockProps {
  data: CardsTableMetadata;
  context?: 'rhc' | 'command';
  onLimitChange?: (cardId: string, newLimit: number) => void;
  onFreezeChange?: (cardId: string, frozen: boolean) => void;
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
 * CardsTableBlock - Displays cards in chat with expand/collapse details
 * Uses a card-based layout for polished expand/collapse behavior
 */
export function CardsTableBlock({ 
  data, 
  context = 'rhc',
  onLimitChange,
  onFreezeChange,
  className = '' 
}: CardsTableBlockProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(data.showDetailFor || null);
  const [frozenCards, setFrozenCards] = useState<Set<string>>(new Set());
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');
  const [updatedLimits, setUpdatedLimits] = useState<Record<string, number>>({});
  
  const isCompact = context === 'rhc';
  
  const handleStartEdit = (card: CardTableRow) => {
    setEditingCardId(card.id);
    setEditLimitValue((updatedLimits[card.id] || card.limit).toString());
  };
  
  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditLimitValue('');
  };
  
  const handleSaveLimit = (cardId: string) => {
    const newLimit = parseFloat(editLimitValue.replace(/,/g, ''));
    if (!isNaN(newLimit) && newLimit > 0) {
      setUpdatedLimits(prev => ({ ...prev, [cardId]: newLimit }));
      onLimitChange?.(cardId, newLimit);
    }
    setEditingCardId(null);
    setEditLimitValue('');
  };
  
  const getEffectiveLimit = (card: CardTableRow): number => {
    return updatedLimits[card.id] || card.limit;
  };
  
  const handleToggleFreeze = (cardId: string, currentStatus: string) => {
    const willBeFrozen = !(currentStatus === 'frozen' || frozenCards.has(cardId));
    setFrozenCards(prev => {
      const next = new Set(prev);
      if (currentStatus === 'frozen' || next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
    onFreezeChange?.(cardId, willBeFrozen);
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

  const toggleExpand = (cardId: string) => {
    setExpandedCardId(prev => prev === cardId ? null : cardId);
  };
  
  return (
    <div className={`chat-cards-block ${isCompact ? 'chat-cards-block--compact' : ''} ${className}`}>
      {data.title && (
        <h4 className="text-label-demi chat-cards-block__title">
          {data.title}
        </h4>
      )}
      
      <div className="chat-cards-list">
        {data.rows.map((card) => {
          const isExpanded = expandedCardId === card.id;
          const effectiveStatus = getEffectiveStatus(card);
          const isRevealed = revealedCards.has(card.id);
          const isOverLimit = card.spent > card.limit;
          
          return (
            <div 
              key={card.id}
              className={`chat-card-item ${isExpanded ? 'chat-card-item--expanded' : ''}`}
            >
              {/* Card Header - Always Visible */}
              <button
                type="button"
                className="chat-card-header"
                onClick={() => toggleExpand(card.id)}
                aria-expanded={isExpanded}
              >
                <div className="chat-card-header__main">
                  <div className="chat-card-header__info">
                    <span className="text-body-sm-demi chat-card-header__name">
                      {card.cardholder}
                    </span>
                    <span className="text-tiny chat-card-header__card">
                      {card.cardName || `•••• ${card.cardLast4}`}
                    </span>
                  </div>
                  
                  <div className="chat-card-header__amounts">
                    <span 
                      className={`text-body-sm chat-card-header__spent ${isOverLimit ? 'chat-card-header__spent--over' : ''}`}
                    >
                      {formatCurrency(card.spent)}
                    </span>
                    <span className="text-tiny chat-card-header__limit">
                      of {formatCurrency(getEffectiveLimit(card))}
                    </span>
                  </div>
                </div>
                
                <div className="chat-card-header__meta">
                  <Badge 
                    type={getStatusBadgeVariant(effectiveStatus as CardTableRow['status'])} 
                    label={effectiveStatus} 
                  />
                  <Icon 
                    icon={faChevronDown} 
                    size="small" 
                    className={`chat-card-header__chevron ${isExpanded ? 'chat-card-header__chevron--expanded' : ''}`}
                  />
                </div>
              </button>
              
              {/* Card Details - Expandable */}
              {isExpanded && (
                <div className="chat-card-details">
                  {/* Card Number Row */}
                  <div className="chat-card-details__row">
                    <span className="text-label chat-card-details__label">
                      Card Number
                    </span>
                    <div className="chat-card-details__value">
                      <span className="text-body-sm chat-card-details__number">
                        {isRevealed ? `4242 4242 4242 ${card.cardLast4}` : `•••• •••• •••• ${card.cardLast4}`}
                      </span>
                      <DSButton
                        variant="tertiary"
                        size="small"
                        iconOnly
                        aria-label={isRevealed ? 'Hide card number' : 'Show card number'}
                        onClick={() => handleToggleReveal(card.id)}
                      >
                        <Icon icon={isRevealed ? faEyeSlash : faEye} size="small" />
                      </DSButton>
                    </div>
                  </div>
                  
                  {/* Monthly Limit Row - Editable */}
                  <div className="chat-card-details__row">
                    <span className="text-label chat-card-details__label">
                      Monthly Limit
                    </span>
                    <div className="chat-card-details__value">
                      {editingCardId === card.id ? (
                        <div className="chat-card-details__edit">
                          <DSTextInput
                            prefix="$"
                            value={editLimitValue}
                            onChange={(e) => setEditLimitValue(e.target.value.replace(/[^0-9]/g, ''))}
                            containerClassName="chat-card-details__input"
                          />
                          <DSButton
                            variant="primary"
                            size="small"
                            iconOnly
                            aria-label="Save limit"
                            onClick={() => handleSaveLimit(card.id)}
                          >
                            <Icon icon={faCheck} size="small" />
                          </DSButton>
                          <DSButton
                            variant="tertiary"
                            size="small"
                            iconOnly
                            aria-label="Cancel"
                            onClick={() => handleCancelEdit()}
                          >
                            <Icon icon={faXmark} size="small" />
                          </DSButton>
                        </div>
                      ) : (
                        <>
                          <span className="text-body-sm chat-card-details__number">
                            {formatCurrency(getEffectiveLimit(card))}
                          </span>
                          <DSButton
                            variant="tertiary"
                            size="small"
                            iconOnly
                            aria-label="Edit limit"
                            onClick={() => handleStartEdit(card)}
                          >
                            <Icon icon={faPencil} size="small" />
                          </DSButton>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="chat-card-details__actions">
                    <DSButton
                      variant={effectiveStatus === 'frozen' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => handleToggleFreeze(card.id, effectiveStatus)}
                    >
                      <Icon icon={faSnowflake} size="small" />
                      {effectiveStatus === 'frozen' ? 'Unfreeze Card' : 'Freeze Card'}
                    </DSButton>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
