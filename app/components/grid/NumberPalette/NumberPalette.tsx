/**
 * Number Palette Component
 *
 * Draggable numbers that can be dropped onto the grid.
 */

import { memo } from "react";
import { useDrag } from "react-dnd";
import { usePuzzleStore } from "../../../store/puzzleStore";
import { useUIStore } from "../../../store/uiStore";
import { DND_ITEM_TYPE, type DragItem } from "../Cell/Cell";
import { valueToSymbol } from "../../../core/utils/gridHelpers";
import styles from "./NumberPalette.module.scss";

export function NumberPalette() {
  const gridSize = usePuzzleStore((state) => state.gridSize);
  const highlightValue = useUIStore((state) => state.highlightValue);
  const highlightedValue = useUIStore((state) => state.highlightedValue);

  const numbers = Array.from({ length: gridSize }, (_, i) => i + 1);

  return (
    <div className={styles.palette} role="toolbar" aria-label="Number palette">
      {numbers.map((num) => (
        <DraggableNumber
          key={num}
          value={num}
          gridSize={gridSize}
          isHighlighted={highlightedValue === num}
          onHover={() => highlightValue(num)}
          onLeave={() => highlightValue(null)}
        />
      ))}
    </div>
  );
}

interface DraggableNumberProps {
  value: number;
  gridSize: number;
  isHighlighted: boolean;
  onHover: () => void;
  onLeave: () => void;
}

const DraggableNumber = memo(function DraggableNumber({
  value,
  gridSize,
  isHighlighted,
  onHover,
  onLeave,
}: DraggableNumberProps) {
  const selectedCell = useUIStore((state) => state.selectedCell);
  const setCell = usePuzzleStore((state) => state.setCell);
  const inputMode = useUIStore((state) => state.inputMode);
  const togglePencilMark = usePuzzleStore((state) => state.togglePencilMark);

  const [{ isDragging }, dragRef] = useDrag<DragItem, void, { isDragging: boolean }>(
    () => ({
      type: DND_ITEM_TYPE,
      item: { type: DND_ITEM_TYPE, value },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [value]
  );

  // Handle click to input number
  const handleClick = () => {
    if (selectedCell) {
      if (inputMode === "pencil") {
        togglePencilMark(selectedCell, value);
      } else {
        setCell(selectedCell, value);
      }
    }
  };

  const classes = [
    styles.number,
    isDragging && styles.dragging,
    isHighlighted && styles.highlighted,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={dragRef}
      className={classes}
      onClick={handleClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label={`Number ${value}`}
      type="button"
    >
      {valueToSymbol(value, gridSize as any)}
    </button>
  );
});
