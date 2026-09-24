import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toEnglishNumber(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return str
    .toString()
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[/٫,]/g, '.')
    .trim();
}

export function toPersianDigits(n: number | string | undefined | null): string {
  if (n === undefined || n === null) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

export interface AppState {
  playerName: string;
  planetRestorationLevel: number; // 0 to 100%
  lifeEnergy: number; // Current spendable Life Energy
  totalEnergyEarned: number; // Lifetime total Life Energy earned
  planetGreenery: number; // 0 to 100: how lush and green the planet is from injected life energy
  completedModules: string[];
  moduleScores: Record<string, number>;
  mistakesLog: Record<string, number>;
  sessionStartTime: number;
}

export const STORAGE_KEY = 'GalaxyAcademy_V3_DB';

export const defaultAppState: AppState = {
  playerName: '',
  planetRestorationLevel: 0,
  lifeEnergy: 0,
  totalEnergyEarned: 0,
  planetGreenery: 0,
  completedModules: [],
  moduleScores: {
    fractions: 0,
    decimals: 0,
    ratios: 0,
    geometry: 0,
    statistics: 0,
  },
  mistakesLog: {
    fractions: 0,
    decimals: 0,
    ratios: 0,
    geometry: 0,
    statistics: 0,
  },
  sessionStartTime: Date.now(),
};

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return defaultAppState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultAppState,
      ...parsed,
      lifeEnergy: parsed.lifeEnergy ?? 0,
      totalEnergyEarned: parsed.totalEnergyEarned ?? 0,
      planetGreenery: parsed.planetGreenery ?? 0,
      moduleScores: { ...defaultAppState.moduleScores, ...(parsed.moduleScores || {}) },
      mistakesLog: { ...defaultAppState.mistakesLog, ...(parsed.mistakesLog || {}) },
    };
  } catch {
    return defaultAppState;
  }
}

export function saveAppState(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}
