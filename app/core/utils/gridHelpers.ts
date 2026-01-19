/**
 * Helper functions for grid operations
 */

import type { Coordinate, GridSize, PuzzleConfig, CellState } from "../models/types";

/**
 * Convert coordinate to cell ID string
 */
export function coordToId(coord: Coordinate): string {
  return `r${coord.row}c${coord.col}`;
}

/**
 * Convert cell ID string to coordinate
 */
export function idToCoord(id: string): Coordinate {
  const match = id.match(/r(\d+)c(\d+)/);
  if (!match) {
    throw new Error(`Invalid cell ID: ${id}`);
  }
  return {
    row: parseInt(match[1], 10),
    col: parseInt(match[2], 10),
  };
}

/**
 * Create puzzle configuration for a given grid size
 */
export function createPuzzleConfig(size: GridSize): PuzzleConfig {
  const boxSize = Math.sqrt(size);

  if (!Number.isInteger(boxSize)) {
    throw new Error(`Grid size must be a perfect square. Got: ${size}`);
  }

  return {
    gridSize: size,
    boxWidth: boxSize,
    boxHeight: boxSize,
    minClues: getMinimumClues(size),
    maxValue: size,
  };
}

/**
 * Get minimum number of clues for a unique solution
 */
export function getMinimumClues(_size: GridSize): number {
  // For 9x9 Sudoku, the proven minimum is 17
  return 17;
}

/**
 * Get the box index for a given coordinate
 */
export function getBoxIndex(row: number, col: number, boxSize: number): number {
  const boxRow = Math.floor(row / boxSize);
  const boxCol = Math.floor(col / boxSize);
  return boxRow * boxSize + boxCol;
}

/**
 * Get coordinates of all cells in a row
 */
export function getRowCoordinates(row: number, gridSize: GridSize): Coordinate[] {
  const coords: Coordinate[] = [];
  for (let col = 0; col < gridSize; col++) {
    coords.push({ row, col });
  }
  return coords;
}

/**
 * Get coordinates of all cells in a column
 */
export function getColCoordinates(col: number, gridSize: GridSize): Coordinate[] {
  const coords: Coordinate[] = [];
  for (let row = 0; row < gridSize; row++) {
    coords.push({ row, col });
  }
  return coords;
}

/**
 * Get coordinates of all cells in a box
 */
export function getBoxCoordinates(
  boxIndex: number,
  gridSize: GridSize
): Coordinate[] {
  const boxSize = Math.sqrt(gridSize);
  const boxRow = Math.floor(boxIndex / boxSize);
  const boxCol = boxIndex % boxSize;
  const startRow = boxRow * boxSize;
  const startCol = boxCol * boxSize;

  const coords: Coordinate[] = [];
  for (let r = 0; r < boxSize; r++) {
    for (let c = 0; c < boxSize; c++) {
      coords.push({ row: startRow + r, col: startCol + c });
    }
  }
  return coords;
}

/**
 * Get all peer coordinates for a cell (same row, column, or box)
 */
export function getPeerCoordinates(
  coord: Coordinate,
  gridSize: GridSize
): Coordinate[] {
  const boxSize = Math.sqrt(gridSize);
  const boxIndex = getBoxIndex(coord.row, coord.col, boxSize);

  const peers = new Map<string, Coordinate>();

  // Add row peers
  for (const c of getRowCoordinates(coord.row, gridSize)) {
    if (c.row !== coord.row || c.col !== coord.col) {
      peers.set(coordToId(c), c);
    }
  }

  // Add column peers
  for (const c of getColCoordinates(coord.col, gridSize)) {
    if (c.row !== coord.row || c.col !== coord.col) {
      peers.set(coordToId(c), c);
    }
  }

  // Add box peers
  for (const c of getBoxCoordinates(boxIndex, gridSize)) {
    if (c.row !== coord.row || c.col !== coord.col) {
      peers.set(coordToId(c), c);
    }
  }

  return Array.from(peers.values());
}

/**
 * Iterate through all coordinates in a grid
 */
export function* iterateGrid(size: GridSize): Generator<Coordinate> {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      yield { row, col };
    }
  }
}

/**
 * Get symbol set for the grid (1-9 for standard Sudoku)
 */
export function getSymbolSet(_size: GridSize): string[] {
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
}

/**
 * Convert a value to its display symbol
 */
export function valueToSymbol(value: number, gridSize: GridSize): string {
  const symbols = getSymbolSet(gridSize);
  return symbols[value - 1] || String(value);
}

/**
 * Convert a symbol to its numeric value
 */
export function symbolToValue(symbol: string, gridSize: GridSize): number | null {
  const symbols = getSymbolSet(gridSize);
  const index = symbols.indexOf(symbol.toUpperCase());
  return index >= 0 ? index + 1 : null;
}

/**
 * Check if a grid size is valid (must be 9 for standard Sudoku)
 */
export function isValidGridSize(size: number): size is GridSize {
  return size === 9;
}

/**
 * Create an empty cell state
 */
export function createEmptyCell(
  coord: Coordinate,
  gridSize: GridSize
): CellState {
  const boxSize = Math.sqrt(gridSize);
  return {
    id: coordToId(coord),
    coordinate: coord,
    value: null,
    isGiven: false,
    isValid: true,
    possibleValues: new Set(Array.from({ length: gridSize }, (_, i) => i + 1)),
    pencilMarks: new Set(),
    groupIndex: getBoxIndex(coord.row, coord.col, boxSize),
  };
}

/**
 * Deep clone a cell state
 */
export function cloneCellState(cell: CellState): CellState {
  return {
    ...cell,
    coordinate: { ...cell.coordinate },
    possibleValues: new Set(cell.possibleValues),
    pencilMarks: new Set(cell.pencilMarks),
  };
}

/**
 * Deep clone a cells map
 */
export function cloneCellsMap(cells: Map<string, CellState>): Map<string, CellState> {
  const cloned = new Map<string, CellState>();
  for (const [id, cell] of cells) {
    cloned.set(id, cloneCellState(cell));
  }
  return cloned;
}
