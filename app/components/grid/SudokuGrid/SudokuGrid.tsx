/**
 * Sudoku Grid Component
 *
 * Main grid component that renders the sudoku puzzle with variable sizes.
 */

import { useMemo, useCallback, useEffect, useRef } from "react";
import { usePuzzleStore } from "../../../store/puzzleStore";
import { useUIStore } from "../../../store/uiStore";
import { Cell } from "../Cell/Cell";
import { coordToId } from "../../../core/utils/gridHelpers";
import type { Coordinate, GridSize } from "../../../core/models/types";
import styles from "./SudokuGrid.module.scss";

export function SudokuGrid() {
  const gridSize = usePuzzleStore((state) => state.gridSize);
  const cells = usePuzzleStore((state) => state.cells);
  const selectedCell = useUIStore((state) => state.selectedCell);
  const selectCell = useUIStore((state) => state.selectCell);
  const highlightedValue = useUIStore((state) => state.highlightedValue);
  const inputMode = useUIStore((state) => state.inputMode);

  const setCell = usePuzzleStore((state) => state.setCell);
  const togglePencilMark = usePuzzleStore((state) => state.togglePencilMark);
  const clearCell = usePuzzleStore((state) => state.clearCell);

  const boxSize = Math.sqrt(gridSize);
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate grid coordinates
  const gridCoordinates = useMemo(() => {
    const coords: Coordinate[][] = [];
    for (let row = 0; row < gridSize; row++) {
      const rowCoords: Coordinate[] = [];
      for (let col = 0; col < gridSize; col++) {
        rowCoords.push({ row, col });
      }
      coords.push(rowCoords);
    }
    return coords;
  }, [gridSize]);

  // Handle cell click
  const handleCellClick = useCallback(
    (coord: Coordinate) => {
      selectCell(coord);
    },
    [selectCell]
  );

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key, "Selected cell:", selectedCell);
      if (!selectedCell) return;

      const cell = cells.get(coordToId(selectedCell));
      console.log("Cell found:", cell?.id, "isGiven:", cell?.isGiven);
      if (!cell) return;

      // Arrow keys for navigation
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const newRow = selectedCell.row > 0 ? selectedCell.row - 1 : gridSize - 1;
        selectCell({ row: newRow, col: selectedCell.col });
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const newRow = selectedCell.row < gridSize - 1 ? selectedCell.row + 1 : 0;
        selectCell({ row: newRow, col: selectedCell.col });
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const newCol = selectedCell.col > 0 ? selectedCell.col - 1 : gridSize - 1;
        selectCell({ row: selectedCell.row, col: newCol });
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const newCol = selectedCell.col < gridSize - 1 ? selectedCell.col + 1 : 0;
        selectCell({ row: selectedCell.row, col: newCol });
        return;
      }

      // Don't modify given cells
      if (cell.isGiven) return;

      // Delete/Backspace to clear
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        clearCell(selectedCell);
        return;
      }

      // Number input
      let value: number | null = null;

      // 1-9 keys
      if (event.key >= "1" && event.key <= "9") {
        value = parseInt(event.key, 10);
      }
      // A-P for 10-25 (larger grids)
      else if (gridSize > 9 && event.key.length === 1) {
        const char = event.key.toUpperCase();
        if (char >= "A" && char <= "P") {
          value = char.charCodeAt(0) - 55; // A=10, B=11, etc.
        }
      }

      if (value !== null && value >= 1 && value <= gridSize) {
        event.preventDefault();
        console.log("Setting value:", value, "at cell:", selectedCell, "mode:", inputMode);
        if (inputMode === "pencil") {
          togglePencilMark(selectedCell, value);
        } else {
          setCell(selectedCell, value);
        }
      }
    },
    [selectedCell, cells, gridSize, inputMode, selectCell, setCell, togglePencilMark, clearCell]
  );

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        gridRef.current &&
        !gridRef.current.contains(event.target as Node) &&
        selectedCell !== null
      ) {
        // Check if click is on an interactive element (buttons, inputs, etc.)
        const target = event.target as HTMLElement;
        const isInteractive =
          target.closest("button") ||
          target.closest("input") ||
          target.closest('[role="button"]') ||
          target.closest('[role="dialog"]') ||
          target.closest('[data-testid="number-palette"]');

        // Only deselect if not clicking on interactive elements
        if (!isInteractive) {
          selectCell(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCell, selectCell]);

  // Determine if a cell should be highlighted
  const isHighlighted = useCallback(
    (coord: Coordinate) => {
      if (!highlightedValue) return false;
      const cell = cells.get(coordToId(coord));
      return cell?.value === highlightedValue;
    },
    [cells, highlightedValue]
  );

  // Determine if a cell is in the same row/col/box as selected
  const isRelated = useCallback(
    (coord: Coordinate) => {
      if (!selectedCell) return false;
      if (coord.row === selectedCell.row && coord.col === selectedCell.col)
        return false;

      // Same row or column
      if (
        coord.row === selectedCell.row ||
        coord.col === selectedCell.col
      )
        return true;

      // Same box
      const selectedBoxRow = Math.floor(selectedCell.row / boxSize);
      const selectedBoxCol = Math.floor(selectedCell.col / boxSize);
      const coordBoxRow = Math.floor(coord.row / boxSize);
      const coordBoxCol = Math.floor(coord.col / boxSize);

      return selectedBoxRow === coordBoxRow && selectedBoxCol === coordBoxCol;
    },
    [selectedCell, boxSize]
  );

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      data-testid="sudoku-grid"
      data-grid-size={gridSize}
      style={
        {
          "--grid-size": gridSize,
          "--box-size": boxSize,
        } as React.CSSProperties
      }
      role="grid"
      aria-label="Sudoku grid"
    >
      {gridCoordinates.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row} role="row">
          {row.map((coord) => {
            const cellId = coordToId(coord);
            const cell = cells.get(cellId);
            const isSelected =
              selectedCell?.row === coord.row &&
              selectedCell?.col === coord.col;

            return (
              <Cell
                key={cellId}
                cell={cell!}
                isSelected={isSelected}
                isRelated={isRelated(coord)}
                isHighlighted={isHighlighted(coord)}
                boxSize={boxSize}
                gridSize={gridSize}
                onClick={() => handleCellClick(coord)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
