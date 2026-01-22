import { useState, useRef } from 'react';
import { Icon } from '@/components/ui/icon';
import { DSButton } from '@/components/ui/ds-button';
import { faPlus, faMicrophone, faArrowUp } from '@/icons';

// Shortcut card labels
const SHORTCUT_CARDS = [
  'Move Money',
  'Balances',
  'Accounts',
  'Recent',
  'Upcoming',
] as const;

export function Command() {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleComposerClick = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="command-page">
      {/* Main content area with gradient background */}
      <div className="command-content">
        {/* Dot grid background with fade overlays */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, var(--neutral-base-300) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              opacity: 0.5,
            }}
          />
          {/* Bottom fade overlay */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 80,
              background: 'linear-gradient(to top, var(--ds-bg-default) 0%, transparent 100%)',
            }}
          />
          {/* Top fade overlay */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: 120,
              background: 'linear-gradient(to bottom, var(--ds-bg-default) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Centered Composer */}
        <div className="command-composer-wrapper">
          <div 
            className={`command-composer ${isFocused ? 'focused' : ''}`}
            onClick={handleComposerClick}
          >
            {/* Text input area */}
            <div className="command-composer-input">
              <textarea
                ref={textareaRef}
                className="command-composer-textarea text-body"
                placeholder="What would you like to do today?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                rows={1}
              />
            </div>

            {/* Actions row */}
            <div className="command-composer-actions">
              {/* Left side - attachment and microphone icons */}
              <div className="flex items-center gap-1">
                <DSButton
                  variant="tertiary"
                  size="large"
                  iconOnly
                >
                  <Icon
                    icon={faPlus}
                    style={{ color: 'var(--ds-icon-secondary)' }}
                  />
                </DSButton>
                <DSButton
                  variant="tertiary"
                  size="large"
                  iconOnly
                >
                  <Icon
                    icon={faMicrophone}
                    style={{ color: 'var(--ds-icon-secondary)' }}
                  />
                </DSButton>
              </div>

              {/* Right side - send button */}
              <DSButton
                variant="primary"
                size="small"
                iconOnly
                disabled={!inputValue.trim()}
              >
                <Icon
                  icon={faArrowUp}
                  size="small"
                  style={{ color: 'var(--ds-icon-on-primary)' }}
                />
              </DSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom shortcut cards */}
      <div className="command-shortcuts">
        {SHORTCUT_CARDS.map((label) => (
          <button key={label} className="command-shortcut-card">
            <span
              className="text-body"
              style={{ color: 'var(--ds-text-default)' }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
