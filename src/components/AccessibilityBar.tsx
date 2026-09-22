import React, { useState } from 'react';
import { ColorVisionMode, DisplaySettings } from '../types';
import { Eye, SunMedium, Contrast, Check, HelpCircle } from 'lucide-react';

interface AccessibilityBarProps {
  settings: DisplaySettings;
  onUpdateSettings: (newSettings: Partial<DisplaySettings>) => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const palettes: {
    id: ColorVisionMode;
    label: string;
    description: string;
    swatches: [string, string, string]; // [Safe, Warning, Danger]
  }[] = [
    {
      id: 'default',
      label: 'Standard',
      description: 'Default Red / Yellow / Green palette for standard trichromatic vision.',
      swatches: ['#10b981', '#f59e0b', '#f43f5e'],
    },
    {
      id: 'deuteranopia',
      label: 'Deuteranopia / Protanopia',
      description: 'Red-green colorblindness: Cobalt Blue (Safe), Amber Gold (Warning), and Vermilion (Scam Alert).',
      swatches: ['#3b82f6', '#f59e0b', '#e11d48'],
    },
    {
      id: 'tritanopia',
      label: 'Tritanopia',
      description: 'Blue-yellow colorblindness: Teal/Cyan (Safe), Violet (Warning), and Dark Magenta (Scam Alert).',
      swatches: ['#06b6d4', '#a855f7', '#db2777'],
    },
  ];

  return (
    <div
      id="accessibility-toggle-bar"
      className={`border-b transition-all ${
        settings.highContrastMode
          ? 'bg-black border-white text-white'
          : 'bg-slate-900/90 border-slate-800/80 text-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Accessibility title & description */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold font-mono-code text-cyan-400">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="tracking-wide uppercase text-[11px]">Display & Accessibility:</span>
          </div>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            WCAG 2.1 AA calibrated high-contrast & color-blind vision modes
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Palette selector pills */}
          <div className="flex items-center rounded-lg p-0.5 bg-slate-950 border border-slate-800">
            {palettes.map((p) => {
              const isSelected = settings.colorVisionMode === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  id={`palette-${p.id}`}
                  onClick={() => onUpdateSettings({ colorVisionMode: p.id })}
                  title={p.description}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono-code transition-all ${
                    isSelected
                      ? settings.highContrastMode
                        ? 'bg-white text-black font-extrabold shadow-sm'
                        : 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  aria-pressed={isSelected}
                >
                  {/* Visual swatches */}
                  <span className="flex items-center -space-x-1 shrink-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: p.swatches[0] }}
                      title="Safe"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: p.swatches[1] }}
                      title="Warning"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: p.swatches[2] }}
                      title="Scam Alert"
                    />
                  </span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            type="button"
            id="toggle-high-contrast"
            onClick={() => onUpdateSettings({ highContrastMode: !settings.highContrastMode })}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg border text-[11px] font-mono-code font-semibold transition-all ${
              settings.highContrastMode
                ? 'bg-white text-black border-white shadow-md'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-900'
            }`}
            title="Toggle Stark High-Contrast Mode (flattens background gradients to pure #000000 and text to #FFFFFF with solid borders)"
            aria-pressed={settings.highContrastMode}
          >
            <Contrast className="w-3.5 h-3.5" />
            <span>High-Contrast Mode</span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.highContrastMode ? 'bg-black' : 'bg-slate-600'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
