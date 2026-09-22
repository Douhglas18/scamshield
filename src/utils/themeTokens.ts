import { ColorVisionMode, ThreatLevel } from '../types';

export interface ThemeColors {
  strokeColor: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
  badgeBg: string;
  pillBg: string;
  label: string;
  subtext: string;
}

export function getThreatTheme(
  score: number,
  mode: ColorVisionMode = 'default',
  highContrast: boolean = false
): ThemeColors {
  if (highContrast) {
    if (score >= 75) {
      return {
        strokeColor: '#ffffff',
        bg: 'bg-black',
        border: 'border-white border-2',
        text: 'text-white',
        glow: 'shadow-none',
        badgeBg: 'bg-white text-black font-extrabold border-white',
        pillBg: 'bg-zinc-900 border-white text-white',
        label: 'CRITICAL SCAM THREAT',
        subtext: 'High-confidence indicators of advance-fee, check fraud, or identity theft detected.',
      };
    }
    if (score >= 50) {
      return {
        strokeColor: '#e4e4e7',
        bg: 'bg-black',
        border: 'border-zinc-300 border-2',
        text: 'text-zinc-100',
        glow: 'shadow-none',
        badgeBg: 'bg-zinc-200 text-black font-bold border-zinc-200',
        pillBg: 'bg-zinc-900 border-zinc-400 text-zinc-100',
        label: 'HIGH RISK ALERT',
        subtext: 'Multiple predatory patterns observed. Extreme caution and verification required.',
      };
    }
    if (score >= 25) {
      return {
        strokeColor: '#a1a1aa',
        bg: 'bg-black',
        border: 'border-zinc-400 border-2',
        text: 'text-zinc-200',
        glow: 'shadow-none',
        badgeBg: 'bg-zinc-800 text-white font-bold border-zinc-400',
        pillBg: 'bg-zinc-900 border-zinc-500 text-zinc-200',
        label: 'CAUTION ADVISED',
        subtext: 'Unorthodox hiring or rental terms detected. Verification recommended.',
      };
    }
    return {
      strokeColor: '#71717a',
      bg: 'bg-black',
      border: 'border-zinc-500 border-2',
      text: 'text-white',
      glow: 'shadow-none',
      badgeBg: 'bg-zinc-800 text-white font-bold border-zinc-500',
      pillBg: 'bg-zinc-900 border-zinc-600 text-zinc-200',
      label: 'VERIFIED LEGITIMATE',
      subtext: 'No fraudulent payment demands, check scams, or identity traps detected.',
    };
  }

  // Deuteranopia / Protanopia (Red-Green Color-Blindness):
  // Safe: Cobalt Blue (#2563eb / #3b82f6)
  // Warning: Amber Gold (#d97706 / #f59e0b)
  // Alert/Scam: Vermilion Pink / Magenta (#e11d48 / #f43f5e)
  if (mode === 'deuteranopia') {
    if (score >= 75) {
      return {
        strokeColor: '#e11d48', // Vermilion / Rose Red
        bg: 'from-pink-950/40 via-rose-950/20 to-slate-950',
        border: 'border-rose-500/50',
        text: 'text-rose-400',
        glow: 'shadow-rose-900/30',
        badgeBg: 'bg-rose-500/20 border-rose-500/50 text-rose-200',
        pillBg: 'bg-rose-950/60 border-rose-800 text-rose-200',
        label: 'CRITICAL SCAM ALERT',
        subtext: 'High-confidence indicators of advance-fee or identity harvesting fraud detected.',
      };
    }
    if (score >= 50) {
      return {
        strokeColor: '#f59e0b', // Amber Gold
        bg: 'from-amber-950/40 via-yellow-950/20 to-slate-950',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        glow: 'shadow-amber-900/30',
        badgeBg: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
        pillBg: 'bg-amber-950/60 border-amber-800 text-amber-200',
        label: 'HIGH RISK (AMBER)',
        subtext: 'Multiple predatory patterns observed. Independent verification required.',
      };
    }
    if (score >= 25) {
      return {
        strokeColor: '#fbbf24', // Yellow Gold
        bg: 'from-yellow-950/30 via-slate-900/40 to-slate-950',
        border: 'border-yellow-500/40',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-900/20',
        badgeBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200',
        pillBg: 'bg-yellow-950/60 border-yellow-800 text-yellow-200',
        label: 'CAUTION ADVISED',
        subtext: 'Unorthodox hiring or rental terms detected. Verification recommended.',
      };
    }
    return {
      strokeColor: '#3b82f6', // High-contrast Cobalt Blue for Safe
      bg: 'from-blue-950/40 via-sky-950/20 to-slate-950',
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      glow: 'shadow-blue-900/30',
      badgeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
      pillBg: 'bg-blue-950/60 border-blue-800 text-blue-200',
      label: 'VERIFIED LEGITIMATE (COBALT)',
      subtext: 'Passed heuristic cross-examination. Standard enterprise hiring structure.',
    };
  }

  // Tritanopia (Blue-Yellow Color-Blindness):
  // Safe: Teal / Cyan (#06b6d4 / #14b8a6)
  // Warning: Lavender / Purple (#a855f7)
  // Alert/Scam: Dark Magenta / Crimson (#db2777)
  if (mode === 'tritanopia') {
    if (score >= 75) {
      return {
        strokeColor: '#db2777', // Dark Magenta
        bg: 'from-fuchsia-950/40 via-pink-950/20 to-slate-950',
        border: 'border-pink-500/50',
        text: 'text-pink-400',
        glow: 'shadow-pink-900/30',
        badgeBg: 'bg-pink-500/20 border-pink-500/50 text-pink-200',
        pillBg: 'bg-pink-950/60 border-pink-800 text-pink-200',
        label: 'CRITICAL SCAM (MAGENTA)',
        subtext: 'High-confidence indicators of advance-fee or identity harvesting fraud detected.',
      };
    }
    if (score >= 50) {
      return {
        strokeColor: '#c026d3', // Fuchsia / Purple
        bg: 'from-purple-950/40 via-fuchsia-950/20 to-slate-950',
        border: 'border-purple-500/50',
        text: 'text-purple-400',
        glow: 'shadow-purple-900/30',
        badgeBg: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
        pillBg: 'bg-purple-950/60 border-purple-800 text-purple-200',
        label: 'HIGH RISK (PURPLE)',
        subtext: 'Multiple predatory patterns observed. Independent verification required.',
      };
    }
    if (score >= 25) {
      return {
        strokeColor: '#a855f7', // Lavender
        bg: 'from-violet-950/30 via-slate-900/40 to-slate-950',
        border: 'border-violet-500/40',
        text: 'text-violet-400',
        glow: 'shadow-violet-900/20',
        badgeBg: 'bg-violet-500/20 border-violet-500/40 text-violet-200',
        pillBg: 'bg-violet-950/60 border-violet-800 text-violet-200',
        label: 'CAUTION ADVISED',
        subtext: 'Unorthodox hiring or rental terms detected. Verification recommended.',
      };
    }
    return {
      strokeColor: '#06b6d4', // Teal / Cyan for Safe
      bg: 'from-cyan-950/40 via-teal-950/20 to-slate-950',
      border: 'border-cyan-500/40',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-900/30',
      badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200',
      pillBg: 'bg-cyan-950/60 border-cyan-800 text-cyan-200',
      label: 'VERIFIED LEGITIMATE (TEAL)',
      subtext: 'Passed heuristic cross-examination. Standard enterprise hiring structure.',
    };
  }

  // Standard Default (Red / Yellow / Green)
  if (score >= 75) {
    return {
      strokeColor: '#f43f5e',
      bg: 'from-rose-950/40 via-red-950/20 to-slate-950',
      border: 'border-red-500/40',
      text: 'text-rose-400',
      glow: 'shadow-red-900/30',
      badgeBg: 'bg-red-500/20 border-red-500/40 text-red-300',
      pillBg: 'bg-red-950/60 border-red-800 text-red-300',
      label: 'CRITICAL THREAT',
      subtext: 'High-confidence indicators of advance-fee or identity harvesting fraud detected.',
    };
  }
  if (score >= 50) {
    return {
      strokeColor: '#f59e0b',
      bg: 'from-amber-950/40 via-orange-950/20 to-slate-950',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      glow: 'shadow-amber-900/30',
      badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      pillBg: 'bg-amber-950/60 border-amber-800 text-amber-300',
      label: 'HIGH RISK',
      subtext: 'Multiple predatory patterns observed. Extreme caution and verification required.',
    };
  }
  if (score >= 25) {
    return {
      strokeColor: '#eab308',
      bg: 'from-yellow-950/30 via-slate-900/40 to-slate-950',
      border: 'border-yellow-500/40',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-900/20',
      badgeBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
      pillBg: 'bg-yellow-950/60 border-yellow-800 text-yellow-300',
      label: 'CAUTION ADVISED',
      subtext: 'Unorthodox hiring or rental terms detected. Verification recommended.',
    };
  }
  return {
    strokeColor: '#10b981',
    bg: 'from-emerald-950/40 via-teal-950/20 to-slate-950',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-900/30',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    pillBg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
    label: 'VERIFIED LEGITIMATE',
    subtext: 'Passed heuristic cross-examination. Standard corporate hiring safeguards present.',
  };
}
