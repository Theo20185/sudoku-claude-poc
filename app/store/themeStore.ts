/**
 * Theme Store
 *
 * Manages theme preferences including colors, mode, and background images.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ThemeMode } from "../core/models/types";

export interface ThemePreset {
  name: string;
  displayName: string;
  mode: "light" | "dark";
  colors: {
    primary: string;
    secondary: string;
    cellBackground: string;
    cellBorder: string;
    boxBorder: string;
    givenText: string;
    userText: string;
    conflictBackground: string;
    selectedBackground: string;
    hintText: string;
  };
  backgroundImage?: string;
}

interface ThemeStoreState {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  backgroundImage: string | null;
  presetName: string | null;
  customColors: {
    cellBackground?: string;
    cellBorder?: string;
    boxBorder?: string;
    givenText?: string;
    userText?: string;
    conflictBackground?: string;
    selectedBackground?: string;
    hintText?: string;
  };
}

interface ThemeStoreActions {
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setBackgroundImage: (url: string | null) => void;
  setCustomColor: (key: keyof ThemeStoreState["customColors"], color: string) => void;
  applyPreset: (preset: ThemePreset) => void;
  resetToDefault: () => void;
  clearBackgroundImage: () => void;
}

type ThemeStore = ThemeStoreState & ThemeStoreActions;

export const themePresets: ThemePreset[] = [
  {
    name: "classic-light",
    displayName: "Classic Light",
    mode: "light",
    colors: {
      primary: "#1976d2",
      secondary: "#dc004e",
      cellBackground: "#ffffff",
      cellBorder: "#bdbdbd",
      boxBorder: "#212121",
      givenText: "#000000",
      userText: "#1976d2",
      conflictBackground: "#ffcdd2",
      selectedBackground: "#e3f2fd",
      hintText: "#757575",
    },
  },
  {
    name: "dark-mode",
    displayName: "Dark Mode",
    mode: "dark",
    colors: {
      primary: "#90caf9",
      secondary: "#f48fb1",
      cellBackground: "#303030",
      cellBorder: "#424242",
      boxBorder: "#e0e0e0",
      givenText: "#ffffff",
      userText: "#90caf9",
      conflictBackground: "#5d4037",
      selectedBackground: "#1e3a5f",
      hintText: "#9e9e9e",
    },
  },
  {
    name: "ocean",
    displayName: "Ocean Blue",
    mode: "light",
    colors: {
      primary: "#0288d1",
      secondary: "#00acc1",
      cellBackground: "#e1f5fe",
      cellBorder: "#4fc3f7",
      boxBorder: "#01579b",
      givenText: "#01579b",
      userText: "#0277bd",
      conflictBackground: "#ffab91",
      selectedBackground: "#b3e5fc",
      hintText: "#546e7a",
    },
  },
  {
    name: "forest",
    displayName: "Forest Green",
    mode: "light",
    colors: {
      primary: "#2e7d32",
      secondary: "#558b2f",
      cellBackground: "#e8f5e9",
      cellBorder: "#81c784",
      boxBorder: "#1b5e20",
      givenText: "#1b5e20",
      userText: "#2e7d32",
      conflictBackground: "#ffcc80",
      selectedBackground: "#c8e6c9",
      hintText: "#4e342e",
    },
  },
  {
    name: "sunset",
    displayName: "Sunset",
    mode: "light",
    colors: {
      primary: "#e65100",
      secondary: "#ff6f00",
      cellBackground: "#fff3e0",
      cellBorder: "#ffb74d",
      boxBorder: "#e65100",
      givenText: "#bf360c",
      userText: "#e65100",
      conflictBackground: "#ef9a9a",
      selectedBackground: "#ffe0b2",
      hintText: "#6d4c41",
    },
  },
  {
    name: "midnight",
    displayName: "Midnight",
    mode: "dark",
    colors: {
      primary: "#7c4dff",
      secondary: "#448aff",
      cellBackground: "#1a1a2e",
      cellBorder: "#16213e",
      boxBorder: "#7c4dff",
      givenText: "#e0e0e0",
      userText: "#7c4dff",
      conflictBackground: "#4a1c40",
      selectedBackground: "#0f3460",
      hintText: "#78909c",
    },
  },
];

const defaultState: ThemeStoreState = {
  mode: "system",
  primaryColor: "#1976d2",
  secondaryColor: "#dc004e",
  backgroundImage: null,
  presetName: null,
  customColors: {},
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set) => ({
        ...defaultState,

        setMode: (mode) =>
          set({
            mode,
          }),

        toggleMode: () =>
          set((state) => ({
            mode:
              state.mode === "light"
                ? "dark"
                : state.mode === "dark"
                ? "system"
                : "light",
          })),

        setPrimaryColor: (color) =>
          set({
            primaryColor: color,
            presetName: null,
          }),

        setSecondaryColor: (color) =>
          set({
            secondaryColor: color,
            presetName: null,
          }),

        setBackgroundImage: (url) =>
          set({
            backgroundImage: url,
          }),

        setCustomColor: (key, color) =>
          set((state) => ({
            customColors: {
              ...state.customColors,
              [key]: color,
            },
            presetName: null,
          })),

        applyPreset: (preset) =>
          set({
            mode: preset.mode,
            primaryColor: preset.colors.primary,
            secondaryColor: preset.colors.secondary,
            presetName: preset.name,
            customColors: {
              cellBackground: preset.colors.cellBackground,
              cellBorder: preset.colors.cellBorder,
              boxBorder: preset.colors.boxBorder,
              givenText: preset.colors.givenText,
              userText: preset.colors.userText,
              conflictBackground: preset.colors.conflictBackground,
              selectedBackground: preset.colors.selectedBackground,
              hintText: preset.colors.hintText,
            },
            backgroundImage: preset.backgroundImage || null,
          }),

        resetToDefault: () =>
          set({
            ...defaultState,
          }),

        clearBackgroundImage: () =>
          set({
            backgroundImage: null,
          }),
      }),
      {
        name: "sudoku-theme",
      }
    ),
    { name: "ThemeStore" }
  )
);

// Helper hook to get effective theme mode (resolves 'system')
export function useEffectiveThemeMode(): "light" | "dark" {
  const mode = useThemeStore((state) => state.mode);

  if (mode === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }

  return mode;
}
