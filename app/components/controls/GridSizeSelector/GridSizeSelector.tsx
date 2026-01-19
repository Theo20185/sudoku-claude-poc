/**
 * Grid Size Selector Component
 *
 * Allows users to select the sudoku grid size (4x4, 9x9, 16x16, 25x25).
 */

import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { usePuzzleStore } from "../../../store/puzzleStore";
import type { GridSize } from "../../../core/models/types";
import styles from "./GridSizeSelector.module.scss";

const gridSizes: { value: GridSize; label: string; description: string }[] = [
  { value: 4, label: "4x4", description: "Beginner (2x2 boxes)" },
  { value: 9, label: "9x9", description: "Standard (3x3 boxes)" },
  { value: 16, label: "16x16", description: "Advanced (4x4 boxes)" },
  { value: 25, label: "25x25", description: "Expert (5x5 boxes)" },
];

export function GridSizeSelector() {
  const gridSize = usePuzzleStore((state) => state.gridSize);
  const initializePuzzle = usePuzzleStore((state) => state.initializePuzzle);

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSize: GridSize | null
  ) => {
    if (newSize !== null && newSize !== gridSize) {
      initializePuzzle(newSize);
    }
  };

  return (
    <ToggleButtonGroup
      value={gridSize}
      exclusive
      onChange={handleChange}
      aria-label="Grid size"
      size="small"
      className={styles.selector}
    >
      {gridSizes.map((size) => (
        <Tooltip key={size.value} title={size.description} arrow>
          <ToggleButton
            value={size.value}
            aria-label={size.description}
            className={styles.button}
          >
            {size.label}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
}
