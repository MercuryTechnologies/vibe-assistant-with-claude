import React from 'react';
import GradientCard from './GradientCard';

export interface GradientSettings {
  width: number;
  height: number;
  baseColor: string;
  topGlowColor: string;
  bottomGlowColor: string;
  topGlowOpacity: number;
  bottomGlowOpacity: number;
  topBlurIntensity: number;
  bottomBlurIntensity: number;
  topGlowSize: number;
  bottomGlowSize: number;
  topGlowOffset: number;
  bottomGlowOffset: number;
}

export interface GradientSettingsMoneyIn {
  width: number;
  height: number;
  topGradientColor: string;
  bottomGradientColor: string;
  topGlowColor: string;
  bottomGlowColor: string;
  topGlowOpacity: number;
  bottomGlowOpacity: number;
  topBlurIntensity: number;
  bottomBlurIntensity: number;
  topGlowSize: number;
  bottomGlowSize: number;
  topGlowOffset: number;
  bottomGlowOffset: number;
}

interface GradientPlaygroundProps {
  settings: GradientSettings;
  onSettingsChange: (settings: Partial<GradientSettings>) => void;
  onReset: () => void;
}

/**
 * GradientPlayground - Interactive component for experimenting with gradient properties
 * 
 * Provides real-time controls for:
 * - Blur intensity
 * - Opacity levels for both glows
 * - Glow positioning offsets
 * - Colors for base and glows
 * - Card dimensions
 */
const GradientPlayground: React.FC<GradientPlaygroundProps> = ({ settings, onSettingsChange, onReset }) => {

  return (
    <div className="flex gap-8 items-start">
      {/* Controls Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 tracking-[-0.01em]">Gradient Controls</h3>
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset
          </button>
        </div>

        <div className="space-y-5">
          {/* Dimensions */}
          <div className="pb-5 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Dimensions</h4>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Width</span>
                  <span className="font-mono text-gray-900">{settings.width}px</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={settings.width}
                  onChange={(e) => onSettingsChange({ width: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Height</span>
                  <span className="font-mono text-gray-900">{settings.height}px</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={settings.height}
                  onChange={(e) => onSettingsChange({ height: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Removed - now using individual blur controls per glow */}

          {/* Top Glow (Pink) */}
          <div className="pb-5 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Glow (Pink)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Color</span>
                  <span className="font-mono text-gray-900">{settings.topGlowColor}</span>
                </label>
                <input
                  type="color"
                  value={settings.topGlowColor}
                  onChange={(e) => onSettingsChange({ topGlowColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-gray-900">{Math.round(settings.topGlowOpacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.topGlowOpacity}
                  onChange={(e) => onSettingsChange({ topGlowOpacity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Blur Intensity</span>
                  <span className="font-mono text-gray-900">{settings.topBlurIntensity.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={settings.topBlurIntensity}
                  onChange={(e) => onSettingsChange({ topBlurIntensity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Size</span>
                  <span className="font-mono text-gray-900">{settings.topGlowSize.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={settings.topGlowSize}
                  onChange={(e) => onSettingsChange({ topGlowSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Vertical Position</span>
                  <span className="font-mono text-gray-900">{settings.topGlowOffset > 0 ? '+' : ''}{settings.topGlowOffset}px</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={settings.topGlowOffset}
                  onChange={(e) => onSettingsChange({ topGlowOffset: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Bottom Glow (Teal) */}
          <div className="pb-5 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Bottom Glow (Teal)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Color</span>
                  <span className="font-mono text-gray-900">{settings.bottomGlowColor}</span>
                </label>
                <input
                  type="color"
                  value={settings.bottomGlowColor}
                  onChange={(e) => onSettingsChange({ bottomGlowColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-gray-900">{Math.round(settings.bottomGlowOpacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.bottomGlowOpacity}
                  onChange={(e) => onSettingsChange({ bottomGlowOpacity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Blur Intensity</span>
                  <span className="font-mono text-gray-900">{settings.bottomBlurIntensity.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={settings.bottomBlurIntensity}
                  onChange={(e) => onSettingsChange({ bottomBlurIntensity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Size</span>
                  <span className="font-mono text-gray-900">{settings.bottomGlowSize.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={settings.bottomGlowSize}
                  onChange={(e) => onSettingsChange({ bottomGlowSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Vertical Position</span>
                  <span className="font-mono text-gray-900">{settings.bottomGlowOffset > 0 ? '+' : ''}{settings.bottomGlowOffset}px</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={settings.bottomGlowOffset}
                  onChange={(e) => onSettingsChange({ bottomGlowOffset: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Base Color */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Base Color</h4>
            
            <div>
              <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Background</span>
                <span className="font-mono text-gray-900">{settings.baseColor}</span>
              </label>
              <input
                type="color"
                value={settings.baseColor}
                onChange={(e) => onSettingsChange({ baseColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="flex-1 flex items-center justify-center min-h-[400px] bg-gray-50 rounded-xl border border-gray-200 p-12">
        <GradientCard
          width={settings.width}
          height={settings.height}
          baseColor={settings.baseColor}
          topGlowColor={settings.topGlowColor}
          bottomGlowColor={settings.bottomGlowColor}
          topGlowOpacity={settings.topGlowOpacity}
          bottomGlowOpacity={settings.bottomGlowOpacity}
          topBlurIntensity={settings.topBlurIntensity}
          bottomBlurIntensity={settings.bottomBlurIntensity}
          topGlowSize={settings.topGlowSize}
          bottomGlowSize={settings.bottomGlowSize}
          topGlowOffset={settings.topGlowOffset}
          bottomGlowOffset={settings.bottomGlowOffset}
        />
      </div>
    </div>
  );
};

export default GradientPlayground;

