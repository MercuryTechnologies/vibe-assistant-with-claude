import React from 'react';
import GradientCard from './GradientCard';
import GradientCardMoneyIn from './GradientCardMoneyIn';
import { type GradientSettings, type GradientSettingsMoneyIn } from './GradientPlayground';

interface DualGradientPlaygroundProps {
  moneyOutSettings: GradientSettings;
  moneyInSettings: GradientSettingsMoneyIn;
  onMoneyOutChange: (settings: Partial<GradientSettings>) => void;
  onMoneyInChange: (settings: Partial<GradientSettingsMoneyIn>) => void;
  onMoneyOutReset: () => void;
  onMoneyInReset: () => void;
}

/**
 * DualGradientPlayground - Interactive component for experimenting with both Money Out and Money In gradient properties
 */
const DualGradientPlayground: React.FC<DualGradientPlaygroundProps> = ({ 
  moneyOutSettings, 
  moneyInSettings,
  onMoneyOutChange, 
  onMoneyInChange,
  onMoneyOutReset,
  onMoneyInReset 
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Money Out Controls */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-[-0.01em]">Money Out</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onMoneyOutReset}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* Dimensions */}
              <div className="pb-5 border-b border-gray-100">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Dimensions</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Width</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.width}px</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={moneyOutSettings.width}
                      onChange={(e) => onMoneyOutChange({ width: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Height</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.height}px</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      value={moneyOutSettings.height}
                      onChange={(e) => onMoneyOutChange({ height: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Top Glow (Pink) */}
              <div className="pb-4 border-b border-gray-100">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Top Glow (Pink)</h5>
                
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Color</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.topGlowColor}</span>
                    </label>
                    <input
                      type="color"
                      value={moneyOutSettings.topGlowColor}
                      onChange={(e) => onMoneyOutChange({ topGlowColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Opacity</span>
                      <span className="font-mono text-gray-900">{Math.round(moneyOutSettings.topGlowOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={moneyOutSettings.topGlowOpacity}
                      onChange={(e) => onMoneyOutChange({ topGlowOpacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Blur</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.topBlurIntensity.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={moneyOutSettings.topBlurIntensity}
                      onChange={(e) => onMoneyOutChange({ topBlurIntensity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Size</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.topGlowSize.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={moneyOutSettings.topGlowSize}
                      onChange={(e) => onMoneyOutChange({ topGlowSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Glow (Teal) */}
              <div className="pb-4 border-b border-gray-100">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Bottom Glow (Teal)</h5>
                
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Color</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.bottomGlowColor}</span>
                    </label>
                    <input
                      type="color"
                      value={moneyOutSettings.bottomGlowColor}
                      onChange={(e) => onMoneyOutChange({ bottomGlowColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Opacity</span>
                      <span className="font-mono text-gray-900">{Math.round(moneyOutSettings.bottomGlowOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={moneyOutSettings.bottomGlowOpacity}
                      onChange={(e) => onMoneyOutChange({ bottomGlowOpacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Blur</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.bottomBlurIntensity.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={moneyOutSettings.bottomBlurIntensity}
                      onChange={(e) => onMoneyOutChange({ bottomBlurIntensity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Size</span>
                      <span className="font-mono text-gray-900">{moneyOutSettings.bottomGlowSize.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={moneyOutSettings.bottomGlowSize}
                      onChange={(e) => onMoneyOutChange({ bottomGlowSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Base Color */}
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Base Color</h5>
                
                <div>
                  <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Background</span>
                    <span className="font-mono text-gray-900">{moneyOutSettings.baseColor}</span>
                  </label>
                  <input
                    type="color"
                    value={moneyOutSettings.baseColor}
                    onChange={(e) => onMoneyOutChange({ baseColor: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Money Out Preview */}
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
          <GradientCard
            width={moneyOutSettings.width}
            height={moneyOutSettings.height}
            baseColor={moneyOutSettings.baseColor}
            topGlowColor={moneyOutSettings.topGlowColor}
            bottomGlowColor={moneyOutSettings.bottomGlowColor}
            topGlowOpacity={moneyOutSettings.topGlowOpacity}
            bottomGlowOpacity={moneyOutSettings.bottomGlowOpacity}
            topBlurIntensity={moneyOutSettings.topBlurIntensity}
            bottomBlurIntensity={moneyOutSettings.bottomBlurIntensity}
            topGlowSize={moneyOutSettings.topGlowSize}
            bottomGlowSize={moneyOutSettings.bottomGlowSize}
            topGlowOffset={moneyOutSettings.topGlowOffset}
            bottomGlowOffset={moneyOutSettings.bottomGlowOffset}
          />
        </div>

        {/* Money In Controls */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-[-0.01em]">Money In</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onMoneyInReset}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* Dimensions */}
              <div className="pb-5 border-b border-gray-100">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Dimensions</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Width</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.width}px</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={moneyInSettings.width}
                      onChange={(e) => onMoneyInChange({ width: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Height</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.height}px</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      value={moneyInSettings.height}
                      onChange={(e) => onMoneyInChange({ height: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient Colors */}
              <div className="pb-4 border-b border-gray-100">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Linear Gradient</h5>
                
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Top Color</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.topGradientColor}</span>
                    </label>
                    <input
                      type="color"
                      value={moneyInSettings.topGradientColor}
                      onChange={(e) => onMoneyInChange({ topGradientColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Bottom Color</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.bottomGradientColor}</span>
                    </label>
                    <input
                      type="color"
                      value={moneyInSettings.bottomGradientColor}
                      onChange={(e) => onMoneyInChange({ bottomGradientColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Top Glow (Blue) */}
              <div className="pb-4 border-b border-gray-100">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Top Glow (Blue)</h5>
                
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Color</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.topGlowColor}</span>
                    </label>
                    <input
                      type="color"
                      value={moneyInSettings.topGlowColor}
                      onChange={(e) => onMoneyInChange({ topGlowColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Opacity</span>
                      <span className="font-mono text-gray-900">{Math.round(moneyInSettings.topGlowOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={moneyInSettings.topGlowOpacity}
                      onChange={(e) => onMoneyInChange({ topGlowOpacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Blur</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.topBlurIntensity.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={moneyInSettings.topBlurIntensity}
                      onChange={(e) => onMoneyInChange({ topBlurIntensity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Size</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.topGlowSize.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={moneyInSettings.topGlowSize}
                      onChange={(e) => onMoneyInChange({ topGlowSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Glow (Green) */}
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Bottom Glow (Green)</h5>
                
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Color</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.bottomGlowColor}</span>
                    </label>
                    <input
                      type="color"
                      value={moneyInSettings.bottomGlowColor}
                      onChange={(e) => onMoneyInChange({ bottomGlowColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Opacity</span>
                      <span className="font-mono text-gray-900">{Math.round(moneyInSettings.bottomGlowOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={moneyInSettings.bottomGlowOpacity}
                      onChange={(e) => onMoneyInChange({ bottomGlowOpacity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Blur</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.bottomBlurIntensity.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={moneyInSettings.bottomBlurIntensity}
                      onChange={(e) => onMoneyInChange({ bottomBlurIntensity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Size</span>
                      <span className="font-mono text-gray-900">{moneyInSettings.bottomGlowSize.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={moneyInSettings.bottomGlowSize}
                      onChange={(e) => onMoneyInChange({ bottomGlowSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Money In Preview */}
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
          <GradientCardMoneyIn
            width={moneyInSettings.width}
            height={moneyInSettings.height}
            topGradientColor={moneyInSettings.topGradientColor}
            bottomGradientColor={moneyInSettings.bottomGradientColor}
            topGlowColor={moneyInSettings.topGlowColor}
            bottomGlowColor={moneyInSettings.bottomGlowColor}
            topGlowOpacity={moneyInSettings.topGlowOpacity}
            bottomGlowOpacity={moneyInSettings.bottomGlowOpacity}
            topBlurIntensity={moneyInSettings.topBlurIntensity}
            bottomBlurIntensity={moneyInSettings.bottomBlurIntensity}
            topGlowSize={moneyInSettings.topGlowSize}
            bottomGlowSize={moneyInSettings.bottomGlowSize}
            topGlowOffset={moneyInSettings.topGlowOffset}
            bottomGlowOffset={moneyInSettings.bottomGlowOffset}
          />
        </div>
      </div>
    </div>
  );
};

export default DualGradientPlayground;

