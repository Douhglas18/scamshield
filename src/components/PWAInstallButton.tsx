import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, X, Shield, Share, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as standalone installed PWA, hide install triggers
  if (isInstalled) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono-code">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else {
      // If prompt isn't directly dispatchable (e.g. iOS or inside an iframe), show guided modal
      setShowGuideModal(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="rounded-2xl border border-cyan-800/60 bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-slate-900/90 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Install ScamShield on Your Device</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                  PWA Ready
                </span>
              </h4>
              <p className="text-xs text-slate-300">
                Run ScamShield as a standalone app with offline heuristic link scanning, zero browser tabs, and instant home screen launch.
              </p>
            </div>
          </div>

          <button
            id="pwa-install-banner-button"
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono-code text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isInstallable ? 'Install App Now' : 'Add to Home Screen'}</span>
          </button>
        </div>

        {/* Guided Install Modal */}
        {showGuideModal && (
          <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuideModal(false)} />
        )}
      </>
    );
  }

  // Header compact button
  return (
    <>
      <button
        id="pwa-install-header-button"
        onClick={handleInstallClick}
        disabled={installing}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono-code font-bold transition-all shadow-md shadow-cyan-900/40"
        title="Install ScamShield on desktop or mobile"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {/* Guided Install Modal */}
      {showGuideModal && (
        <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuideModal(false)} />
      )}
    </>
  );
};

interface InstallGuideModalProps {
  isIOS: boolean;
  onClose: () => void;
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isIOS, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Install ScamShield App</h3>
            <p className="text-xs text-slate-400">Fast, secure standalone home screen setup</p>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <p className="font-semibold text-cyan-300">How to install on iOS Safari:</p>
            <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-mono-code text-[11px] shrink-0">
                  1
                </span>
                <span className="flex items-center gap-1.5">
                  Tap the <Share className="w-3.5 h-3.5 text-cyan-400 inline" /> <strong>Share</strong> button in Safari's bottom toolbar.
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-mono-code text-[11px] shrink-0">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Scroll down and select <PlusSquare className="w-3.5 h-3.5 text-cyan-400 inline" /> <strong>Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-mono-code text-[11px] shrink-0">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in the top right to complete installation.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <p className="font-semibold text-cyan-300">Install via Browser Menu:</p>
            <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-mono-code text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Look for the <strong>Install</strong> icon (<Download className="w-3 h-3 inline text-cyan-400" />) in your browser address bar (Chrome, Edge, Brave).
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-mono-code text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  On Android Chrome, tap the <strong>three dots (⋮)</strong> menu and select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-mono-code text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  ScamShield will launch in its own native standalone window without address bar borders.
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono-code text-xs font-bold transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
