/**
 * Cell Component
 *
 * Individual cell in the Sudoku grid.
 */

import { memo } from "react";
import { useDrop } from "react-dnd";
import { usePuzzleStore } from "../../../store/puzzleStore";
import { useUIStore } from "../../../store/uiStore";
import type { CellState, GridSize } from "../../../core/models/types";
import { valueToSymbol } from "../../../core/utils/gridHelpers";
import styles from "./Cell.module.scss";

interface CellProps {
  cell: CellState;
  isSelected: boolean;
  isRelated: boolean;
  isHighlighted: boolean;
  boxSize: number;
  gridSize: GridSize;
  onClick: () => void;
}

// Item type for drag and drop
export const DND_ITEM_TYPE = "NUMBER";

export interface DragItem {
  type: typeof DND_ITEM_TYPE;
  value: number;
}

export const Cell = memo(function Cell({
  cell,
  isSelected,
  isRelated,
  isHighlighted,
  boxSize,
  gridSize,
  onClick,
}: CellProps) {
  const setCell = usePuzzleStore((state) => state.setCell);
  const togglePencilMark = usePuzzleStore((state) => state.togglePencilMark);
  const inputMode = useUIStore((state) => state.inputMode);

  // Set up drop target for drag and drop
  const [{ isOver, canDrop }, dropRef] = useDrop<
    DragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: DND_ITEM_TYPE,
      canDrop: () => !cell.isGiven && cell.value === null,
      drop: (item) => {
        if (inputMode === "pencil") {
          togglePencilMark(cell.coordinate, item.value);
        } else {
          setCell(cell.coordinate, item.value);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [cell.isGiven, cell.value, cell.coordinate, inputMode, setCell, togglePencilMark]
  );

  // Determine cell classes
  const cellClasses = [
    styles.cell,
    isSelected && styles.selected,
    isRelated && styles.related,
    isHighlighted && styles.highlighted,
    cell.isGiven && styles.given,
    !cell.isValid && styles.conflict,
    isOver && canDrop && styles.dragOver,
    isOver && !canDrop && styles.dragInvalid,
  ]
    .filter(Boolean)
    .join(" ");

  // Determine if we should show box borders
  const showRightBorder = (cell.coordinate.col + 1) % boxSize === 0 && cell.coordinate.col < gridSize - 1;
  const showBottomBorder = (cell.coordinate.row + 1) % boxSize === 0 && cell.coordinate.row < gridSize - 1;

  return (
    <div
      ref={dropRef}
      className={cellClasses}
      onClick={onClick}
      role="gridcell"
      aria-label={`Row ${cell.coordinate.row + 1}, Column ${cell.coordinate.col + 1}${
        cell.value ? `, Value ${cell.value}` : ", Empty"
      }`}
      aria-selected={isSelected}
      data-row={cell.coordinate.row}
      data-col={cell.coordinate.col}
      style={{
        marginRight: showRightBorder ? "var(--sudoku-box-gap)" : undefined,
      }}
      tabIndex={isSelected ? 0 : -1}
    >
      {cell.value !== null ? (
        <span className={styles.value}>
          {valueToSymbol(cell.value, gridSize)}
        </span>
      ) : (
        <PencilMarks marks={cell.pencilMarks} boxSize={boxSize} gridSize={gridSize} />
      )}
    </div>
  );
});

interface PencilMarksProps {
  marks: Set<number>;
  boxSize: number;
  gridSize: GridSize;
}

const PencilMarks = memo(function PencilMarks({
  marks,
  boxSize,
  gridSize,
}: PencilMarksProps) {
  if (marks.size === 0) return null;

  return (
    <div
      className={styles.pencilMarks}
      style={
        {
          "--pencil-cols": boxSize,
        } as React.CSSProperties
      }
    >
      {Array.from({ length: gridSize }, (_, i) => i + 1).map((num) => (
        <span key={num} className={styles.mark}>
          {marks.has(num) ? valueToSymbol(num, gridSize) : ""}
        </span>
      ))}
    </div>
  );
});
