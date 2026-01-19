/**
 * Home Route
 *
 * Main sudoku game page.
 */

import { useEffect } from "react";
import type { Route } from "./+types/home";
import { AppLayout } from "../components/layout/AppLayout";
import { SudokuGrid } from "../components/grid/SudokuGrid";
import { NumberPalette } from "../components/grid/NumberPalette";
import { HintsPanel } from "../components/hints/HintsPanel";
import { SolverControls } from "../components/controls/SolverControls";
import { InputControls } from "../components/controls/InputControls";
import { TextInputDialog } from "../components/controls/TextInputDialog";
import { usePuzzleStore } from "../store/puzzleStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sudoku" },
    { name: "description", content: "Sudoku puzzle game with solver" },
  ];
}

export default function Home() {
  const initializePuzzle = usePuzzleStore((state) => state.initializePuzzle);

  // Initialize puzzle on first load
  useEffect(() => {
    // Only initialize if no cells exist
    const cells = usePuzzleStore.getState().cells;
    if (cells.size === 0) {
      initializePuzzle(9);
    }
  }, [initializePuzzle]);

  return (
    <>
      <AppLayout
        leftPanel={
          <>
            <HintsPanel />
            <InputControls />
            <SolverControls />
          </>
        }
        rightPanel={
          <>
            <SudokuGrid />
            <NumberPalette />
          </>
        }
      />
      <TextInputDialog />
    </>
  );
}
