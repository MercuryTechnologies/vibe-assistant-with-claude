import { useRef, useState, useMemo } from 'react';
import { DSTable, type DSTableColumn, type DSTableDetailPanelRenderContext } from '@/components/ui/ds-table';
import { DSTableToolbar } from '@/components/ui/ds-table-toolbar';
import { DSButton } from '@/components/ui/ds-button';
import { DSLink } from '@/components/ui/ds-link';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { faXmark, faSnowflake, faList, faChevronDown, faChevronRight, faPencil, faCopy } from '@/icons';
import { useCards, type CardWithSpending } from '@/hooks/useCards';

// Use CardWithSpending from the hook
type Card = CardWithSpending;

// Column definitions
const columns: DSTableColumn<Card>[] = [
  {
    id: 'cardholder',
    header: 'Cardholder',
    accessor: 'cardholder',
    sortable: true,
  },
  {
    id: 'card',
    header: 'Card',
    accessor: 'card',
    sortable: true,
    cell: (value, row) => (
      <span className="text-body">
        <span style={{ color: 'var(--ds-text-default)' }}>{value as string}</span>
        {row.nickname && (
          <span style={{ color: 'var(--ds-text-secondary)' }}> · {row.nickname}</span>
        )}
      </span>
    ),
  },
  {
    id: 'spentThisMonth',
    header: 'Spent this month',
    accessor: 'spentThisMonth',
    sortable: true,
    cell: (value) => {
      // This column represents spend, so always display as a negative amount.
      // DSTable will render this using the shared DS money formatter.
      return -Math.abs(value as number);
    },
  },
  {
    id: 'type',
    header: 'Type',
    accessor: 'type',
    sortable: true,
  },
  {
    id: 'account',
    header: 'Account',
    accessor: 'account',
    sortable: true,
  },
];

// Card data is now loaded from src/data/cards.json via useCards hook

export function Cards() {
  const lastRowRef = useRef<Card | null>(null)
  const { cards: cardsData } = useCards();
  
  // Keyword search state
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Filter cards based on search
  const filteredCards = useMemo(() => {
    // If no search criteria, return all cards
    if (!keywordSearch && selectedKeywords.length === 0) {
      return cardsData;
    }

    return cardsData.filter((card) => {
      const cardNumberLower = card.card.toLowerCase();
      const cardholderLower = card.cardholder.toLowerCase();
      const nicknameLower = (card.nickname || '').toLowerCase();

      // Check if keyword search matches card number, nickname, or cardholder
      if (keywordSearch) {
        const searchLower = keywordSearch.toLowerCase();
        if (
          cardNumberLower.includes(searchLower) ||
          cardholderLower.includes(searchLower) ||
          nicknameLower.includes(searchLower)
        ) {
          return true;
        }
      }

      // Check if any selected keyword matches
      if (selectedKeywords.length > 0) {
        const matchesSelectedKeyword = selectedKeywords.some((keyword) => {
          const k = keyword.toLowerCase();
          return (
            cardNumberLower.includes(k) ||
            cardholderLower.includes(k) ||
            nicknameLower.includes(k)
          );
        });
        if (matchesSelectedKeyword) {
          return true;
        }
      }

      // If we have search criteria but no matches, exclude
      return false;
    });
  }, [keywordSearch, selectedKeywords, cardsData]);

  // Format currency for display
  const formatCurrency = (amount: number, showCents = true) => {
    if (showCents) {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    // Format as compact (e.g., $289.2k)
    if (amount >= 1000) {
      const k = amount / 1000
      return `$${k.toLocaleString('en-US', { maximumFractionDigits: 1 })}k`
    }
    return `$${amount.toLocaleString('en-US')}`
  }

  // Shadow style matching Figma L4 - Dialog
  const shadowStyle = {
    boxShadow: '0px 0px 2px 0px rgba(175, 178, 206, 0.65), 0px 0px 3px 0px rgba(0, 0, 0, 0.09), 0px 12px 16px 0px rgba(0, 0, 0, 0.01), 0px 22px 28px 0px rgba(0, 0, 0, 0.04)'
  }

  const renderCardDetailPanel = ({ row, isOpen, close }: DSTableDetailPanelRenderContext<Card>) => {
    // Keep the last opened row around so we can animate the panel out while still showing content.
    if (row) lastRowRef.current = row
    const displayRow = row ?? lastRowRef.current

    const available = displayRow ? displayRow.monthlyLimit - displayRow.spentThisMonth : 0
    const spendPercentage = displayRow ? (displayRow.spentThisMonth / displayRow.monthlyLimit) * 100 : 0

    const transformValue = isOpen ? 'translateX(0)' : 'translateX(calc(100% + 32px))'

    return (
      <div
        className={cn(
          "detail-panel flex flex-col overflow-hidden rounded-lg",
          !isOpen ? "pointer-events-none" : ""
        )}
        style={{
          position: "fixed",
          top: "calc(var(--ds-top-nav-height) + 16px)",
          bottom: 16,
          right: 16,
          width: 400,
          zIndex: 60,
          backgroundColor: 'var(--ds-bg-default)',
          transform: transformValue,
          ...shadowStyle
        }}
      >
        {displayRow && (
          <>
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <DSButton
                variant="tertiary"
                size="small"
                iconOnly
                onClick={close}
                aria-label="Close panel"
              >
                <Icon icon={faXmark} style={{ color: "var(--ds-icon-secondary)" }} />
              </DSButton>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header section */}
              <div className="p-6 pb-4">
                {/* Card name and amount row */}
                <div className="flex items-start justify-between mb-1">
                  <span className="text-body-lg-demi" style={{ color: 'var(--ds-text-default)' }}>
                    {displayRow.cardName}
                  </span>
                  <span className="text-body-lg-demi tabular-nums" style={{ color: 'var(--ds-text-default)' }}>
                    {formatCurrency(displayRow.spentThisMonth)}
                  </span>
                </div>
                
                {/* Cardholder and label row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                    {displayRow.cardholder}
                  </span>
                  <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                    Spent this month
                  </span>
                </div>

                {/* Progress bar */}
                <div 
                  className="w-full rounded-full mb-2"
                  style={{ height: 6, backgroundColor: 'var(--neutral-base-200)' }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: `${Math.min(spendPercentage, 100)}%`,
                      height: '100%',
                      backgroundColor: 'var(--ds-icon-primary)',
                    }}
                  />
                </div>

                {/* Show details and available */}
                <div className="flex items-center justify-between">
                  <DSLink
                    variant="secondary"
                    icon={faChevronRight}
                    iconPosition="left"
                    label="Show details"
                  />
                  <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                    {formatCurrency(available, false)} available · {formatCurrency(displayRow.monthlyLimit, false)} limit
                  </span>
                </div>
              </div>

              {/* Card visual placeholder */}
              <div className="px-6 pb-4">
                <div 
                  className="rounded-lg border p-6"
                  style={{ 
                    borderColor: 'var(--color-border-default)',
                    backgroundColor: 'var(--ds-bg-default)',
                    aspectRatio: '1.586',
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                    {/* Top row - chip and mastercard logo */}
                    <div className="flex items-start justify-between">
                      {/* Chip placeholder */}
                      <div 
                        className="rounded-md border"
                        style={{ 
                          width: 48, 
                          height: 36,
                          borderColor: 'var(--color-border-default)',
                          backgroundColor: 'var(--neutral-base-100)',
                        }}
                      />
                      {/* Mastercard logo placeholder */}
                      <div 
                        className="flex items-center gap-0"
                        style={{ marginTop: -8 }}
                      >
                        <div 
                          className="rounded-full"
                          style={{ width: 32, height: 32, backgroundColor: 'var(--neutral-base-400)' }}
                        />
                        <div 
                          className="rounded-full"
                          style={{ width: 32, height: 32, backgroundColor: 'var(--neutral-base-300)', marginLeft: -12 }}
                        />
                      </div>
                    </div>
                    
                    {/* Bottom row - card number and pattern */}
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-body tabular-nums" style={{ color: 'var(--ds-text-secondary)', letterSpacing: '2px' }}>
                          •••• •••• •••• {displayRow.card.slice(-4)}
                        </span>
                        <div className="flex items-center gap-6">
                          <span className="text-label" style={{ color: 'var(--ds-text-tertiary)' }}>
                            Exp ••/••
                          </span>
                          <span className="text-label" style={{ color: 'var(--ds-text-tertiary)' }}>
                            CVC •••
                          </span>
                        </div>
                      </div>
                      {/* Pattern placeholder */}
                      <div 
                        className="rounded-full"
                        style={{ 
                          width: 48, 
                          height: 48,
                          border: '2px solid var(--color-border-default)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2">
                  <DSButton variant="secondary" size="small">
                    <Icon icon={faSnowflake} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                    <span>Freeze</span>
                  </DSButton>
                  <DSButton variant="secondary" size="small">
                    <Icon icon={faList} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                    <span>Transactions</span>
                  </DSButton>
                  <DSButton variant="secondary" size="small">
                    <span>More</span>
                    <Icon icon={faChevronDown} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                  </DSButton>
                </div>
              </div>

              {/* Separator */}
              <div 
                className="mx-6"
                style={{ height: 1, backgroundColor: 'var(--color-border-default)' }}
              />

              {/* Details section */}
              <div className="p-6 flex flex-col gap-4">
                {/* Monthly spend limit */}
                <div className="flex items-center justify-between">
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    Monthly spend limit
                  </span>
                  <div className="flex items-center gap-2">
                    <Icon icon={faPencil} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                    <span className="text-body tabular-nums" style={{ color: 'var(--ds-text-default)' }}>
                      {formatCurrency(displayRow.monthlyLimit)}
                    </span>
                  </div>
                </div>

                {/* Account */}
                <div className="flex items-center justify-between">
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    Account
                  </span>
                  <span 
                    className="text-body"
                    style={{ 
                      color: 'var(--ds-text-default)',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    {displayRow.account}
                  </span>
                </div>

                {/* Card type */}
                <div className="flex items-center justify-between">
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    Card type
                  </span>
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    {displayRow.type}
                  </span>
                </div>
              </div>

              {/* Separator */}
              <div 
                className="mx-6"
                style={{ height: 1, backgroundColor: 'var(--color-border-default)' }}
              />

              {/* Billing address section */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-body" style={{ color: 'var(--ds-text-secondary)' }}>
                    Billing address
                  </span>
                  <Icon icon={faCopy} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    {displayRow.billingAddress.street}
                  </span>
                  <span className="text-body" style={{ color: 'var(--ds-text-default)' }}>
                    {displayRow.billingAddress.city}, {displayRow.billingAddress.state} {displayRow.billingAddress.zip}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Quick filters for the toolbar - keyword filter for searching
  const quickFilters = [
    { id: 'keyword', label: 'Search' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-title-main">Cards</h1>
      
      <DSTableToolbar
        viewMenuLabel="All Cards"
        showFilters={false}
        quickFilters={quickFilters}
        keywordSearchQuery={keywordSearch}
        keywordSelectedKeywords={selectedKeywords}
        onKeywordSearchChange={setKeywordSearch}
        onKeywordSelectionChange={setSelectedKeywords}
        showGroupButton={false}
        showSortButton={false}
        showDisplayButton={false}
        showExportButton={false}
      />
      
      <DSTable
        columns={columns}
        data={filteredCards}
        getRowKey={(row) => row.id}
        variant="centered"
        emptyMessage="No cards found"
        renderDetailPanel={renderCardDetailPanel}
      />
    </div>
  );
}
