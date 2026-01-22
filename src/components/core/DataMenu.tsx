import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { faXmark, faGear } from '@/icons';
import { useDataSettings } from '@/context/DataContext';

export function DataMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, formattedTotalBalance, cashFlowLabel } = useDataSettings();

  // Balance slider uses logarithmic scale for better UX
  // $100 = 0, $10M = 100
  const balanceToSlider = (balance: number): number => {
    const minLog = Math.log10(100);
    const maxLog = Math.log10(10000000);
    const currentLog = Math.log10(balance);
    return ((currentLog - minLog) / (maxLog - minLog)) * 100;
  };

  const sliderToBalance = (slider: number): number => {
    const minLog = Math.log10(100);
    const maxLog = Math.log10(10000000);
    const logValue = minLog + (slider / 100) * (maxLog - minLog);
    return Math.round(Math.pow(10, logValue));
  };

  const balanceSliderValue = balanceToSlider(settings.totalBalance);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ds-sidebar-btn"
        style={{ width: '100%' }}
      >
        <div className="ds-sidebar-btn-content">
          <span className="ds-sidebar-icon-wrapper">
            <Icon icon={faGear} />
          </span>
          <span className="ds-sidebar-btn-label">Data</span>
        </div>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="ds-data-menu-panel">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <span 
              className="text-body-demi"
              style={{ color: 'var(--ds-text-default)' }}
            >
              Data Settings
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="ds-chart-settings-close"
              aria-label="Close settings"
            >
              <Icon icon={faXmark} size="small" style={{ color: 'var(--ds-icon-secondary)' }} />
            </button>
          </div>

          {/* Balance Slider */}
          <div className="ds-chart-settings-section">
            <div className="flex items-center justify-between">
              <span className="ds-chart-settings-label">Total Balance</span>
              <span className="ds-chart-settings-value">{formattedTotalBalance}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={balanceSliderValue}
              onChange={(e) => {
                const newBalance = sliderToBalance(parseFloat(e.target.value));
                updateSettings({ totalBalance: newBalance });
              }}
              className="ds-chart-settings-slider"
            />
            <div className="flex justify-between" style={{ marginTop: 4 }}>
              <span className="text-micro" style={{ color: 'var(--ds-text-tertiary)' }}>$100</span>
              <span className="text-micro" style={{ color: 'var(--ds-text-tertiary)' }}>$10M</span>
            </div>
          </div>

          {/* Cash Flow Slider */}
          <div className="ds-chart-settings-section">
            <div className="flex items-center justify-between">
              <span className="ds-chart-settings-label">Cash Flow</span>
              <span 
                className="ds-chart-settings-value"
                style={{ 
                  color: settings.cashFlowDirection < -33 
                    ? 'var(--color-error)' 
                    : settings.cashFlowDirection > 33 
                      ? 'var(--color-success)' 
                      : 'var(--ds-text-secondary)'
                }}
              >
                {cashFlowLabel}
              </span>
            </div>
            <div className="ds-cashflow-slider-container">
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={settings.cashFlowDirection}
                onChange={(e) => {
                  updateSettings({ cashFlowDirection: parseInt(e.target.value) });
                }}
                className="ds-chart-settings-slider ds-cashflow-slider"
              />
            </div>
            <div className="flex justify-between" style={{ marginTop: 4 }}>
              <span className="text-micro" style={{ color: 'var(--color-error)' }}>Negative</span>
              <span className="text-micro" style={{ color: 'var(--ds-text-tertiary)' }}>Neutral</span>
              <span className="text-micro" style={{ color: 'var(--color-success)' }}>Positive</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="ds-chart-settings-section">
            <span className="ds-chart-settings-label">Quick Presets</span>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
              <button
                onClick={() => updateSettings({ totalBalance: 100000, cashFlowDirection: -50 })}
                className="ds-preset-btn"
              >
                Startup
              </button>
              <button
                onClick={() => updateSettings({ totalBalance: 1000000, cashFlowDirection: 0 })}
                className="ds-preset-btn"
              >
                Growing
              </button>
              <button
                onClick={() => updateSettings({ totalBalance: 5000000, cashFlowDirection: 50 })}
                className="ds-preset-btn"
              >
                Established
              </button>
              <button
                onClick={() => updateSettings({ totalBalance: 10000000, cashFlowDirection: 75 })}
                className="ds-preset-btn"
              >
                Enterprise
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
