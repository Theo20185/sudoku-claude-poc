/**
 * UI Store
 *
 * Manages UI state like selected cells, modals, and input modes.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Coordinate, HintsMode, InputMode, InputMethod } from "../core/models/types";

interface UIStoreState {
  // Selection
  selectedCell: Coordinate | null;
  highlightedValue: number | null;

  // Input modes
  inputMode: InputMode;
  inputMethod: InputMethod;

  // Hints
  showHints: boolean;
  hintsMode: HintsMode;

  // Modals
  isTextInputOpen: boolean;
  isSettingsOpen: boolean;
  isSolutionsModalOpen: boolean;
  isHelpOpen: boolean;

  // UI state
  isSidebarCollapsed: boolean;
}

interface UIStoreActions {
  // Selection
  selectCell: (coord: Coordinate | null) => void;
  selectCellById: (id: string | null) => void;
  highlightValue: (value: number | null) => void;
  moveSelection: (direction: "up" | "down" | "left" | "right") => void;

  // Input modes
  setInputMode: (mode: InputMode) => void;
  toggleInputMode: () => void;
  setInputMethod: (method: InputMethod) => void;

  // Hints
  toggleHints: () => void;
  setHintsMode: (mode: HintsMode) => void;

  // Modals
  openTextInput: () => void;
  closeTextInput: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openSolutionsModal: () => void;
  closeSolutionsModal: () => void;
  openHelp: () => void;
  closeHelp: () => void;
  closeAllModals: () => void;

  // UI state
  toggleSidebar: () => void;
}

type UIStore = UIStoreState & UIStoreActions;

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedCell: null,
        highlightedValue: null,
        inputMode: "value",
        inputMethod: "click",
        showHints: false,
        hintsMode: "selected",
        isTextInputOpen: false,
        isSettingsOpen: false,
        isSolutionsModalOpen: false,
        isHelpOpen: false,
        isSidebarCollapsed: false,

        // Selection actions
        selectCell: (coord) =>
          set({
            selectedCell: coord,
          }),

        selectCellById: (id) => {
          if (!id) {
            set({ selectedCell: null });
            return;
          }

          const match = id.match(/r(\d+)c(\d+)/);
          if (match) {
            set({
              selectedCell: {
                row: parseInt(match[1], 10),
                col: parseInt(match[2], 10),
              },
            });
          }
        },

        highlightValue: (value) =>
          set({
            highlightedValue: value,
          }),

        moveSelection: (direction) => {
          const { selectedCell } = get();
          if (!selectedCell) return;

          let { row, col } = selectedCell;

          // We need to know the grid size - default to 9
          // In real usage, this would come from puzzle store
          const gridSize = 9;

          switch (direction) {
            case "up":
              row = row > 0 ? row - 1 : gridSize - 1;
              break;
            case "down":
              row = row < gridSize - 1 ? row + 1 : 0;
              break;
            case "left":
              col = col > 0 ? col - 1 : gridSize - 1;
              break;
            case "right":
              col = col < gridSize - 1 ? col + 1 : 0;
              break;
          }

          set({ selectedCell: { row, col } });
        },

        // Input mode actions
        setInputMode: (mode) =>
          set({
            inputMode: mode,
          }),

        toggleInputMode: () =>
          set((state) => ({
            inputMode: state.inputMode === "value" ? "pencil" : "value",
          })),

        setInputMethod: (method) =>
          set({
            inputMethod: method,
          }),

        // Hints actions
        toggleHints: () =>
          set((state) => ({
            showHints: !state.showHints,
          })),

        setHintsMode: (mode) =>
          set({
            hintsMode: mode,
          }),

        // Modal actions
        openTextInput: () =>
          set({
            isTextInputOpen: true,
          }),

        closeTextInput: () =>
          set({
            isTextInputOpen: false,
          }),

        openSettings: () =>
          set({
            isSettingsOpen: true,
          }),

        closeSettings: () =>
          set({
            isSettingsOpen: false,
          }),

        openSolutionsModal: () =>
          set({
            isSolutionsModalOpen: true,
          }),

        closeSolutionsModal: () =>
          set({
            isSolutionsModalOpen: false,
          }),

        openHelp: () =>
          set({
            isHelpOpen: true,
          }),

        closeHelp: () =>
          set({
            isHelpOpen: false,
          }),

        closeAllModals: () =>
          set({
            isTextInputOpen: false,
            isSettingsOpen: false,
            isSolutionsModalOpen: false,
            isHelpOpen: false,
          }),

        // UI state actions
        toggleSidebar: () =>
          set((state) => ({
            isSidebarCollapsed: !state.isSidebarCollapsed,
          })),
      }),
      {
        name: "sudoku-ui",
        partialize: (state) => ({
          inputMode: state.inputMode,
          inputMethod: state.inputMethod,
          showHints: state.showHints,
          hintsMode: state.hintsMode,
          isSidebarCollapsed: state.isSidebarCollapsed,
        }),
      }
    ),
    { name: "UIStore" }
  )
);
