/**
 * Grid class - manages the Sudoku grid state and operations
 */

import type {
  Coordinate,
  GridSize,
  PuzzleConfig,
  CellState,
  CellValue,
  Solution,
  PuzzleSnapshot,
} from "./types";
import {
  coordToId,
  createPuzzleConfig,
  createEmptyCell,
  getRowCoordinates,
  getColCoordinates,
  getBoxCoordinates,
  getPeerCoordinates,
  getBoxIndex,
  iterateGrid,
  cloneCellsMap,
  cloneCellState,
} from "../utils/gridHelpers";

export class Grid {
  readonly config: PuzzleConfig;
  private cells: Map<string, CellState>;

  constructor(size: GridSize) {
    this.config = createPuzzleConfig(size);
    this.cells = this.initializeCells();
  }

  private initializeCells(): Map<string, CellState> {
    const cells = new Map<string, CellState>();
    for (const coord of iterateGrid(this.config.gridSize)) {
      const cell = createEmptyCell(coord, this.config.gridSize);
      cells.set(cell.id, cell);
    }
    return cells;
  }

  /**
   * Get a cell by coordinate
   */
  getCell(coord: Coordinate): CellState | undefined {
    return this.cells.get(coordToId(coord));
  }

  /**
   * Get a cell by ID
   */
  getCellById(id: string): CellState | undefined {
    return this.cells.get(id);
  }

  /**
   * Get all cells
   */
  getAllCells(): CellState[] {
    return Array.from(this.cells.values());
  }

  /**
   * Get all empty cells
   */
  getEmptyCells(): CellState[] {
    return this.getAllCells().filter((cell) => cell.value === null);
  }

  /**
   * Get filled cells
   */
  getFilledCells(): CellState[] {
    return this.getAllCells().filter((cell) => cell.value !== null);
  }

  /**
   * Set a cell value
   */
  setValue(coord: Coordinate, value: CellValue): void {
    const cell = this.getCell(coord);
    if (!cell) return;

    cell.value = value;
    if (value !== null) {
      cell.pencilMarks.clear();
    }
  }

  /**
   * Set a cell as given (initial puzzle value)
   */
  setGiven(coord: Coordinate, value: number): void {
    const cell = this.getCell(coord);
    if (!cell) return;

    cell.value = value;
    cell.isGiven = true;
    cell.pencilMarks.clear();
  }

  /**
   * Clear a cell (if not given)
   */
  clearCell(coord: Coordinate): void {
    const cell = this.getCell(coord);
    if (!cell || cell.isGiven) return;

    cell.value = null;
  }

  /**
   * Toggle a pencil mark
   */
  togglePencilMark(coord: Coordinate, value: number): void {
    const cell = this.getCell(coord);
    if (!cell || cell.value !== null) return;

    if (cell.pencilMarks.has(value)) {
      cell.pencilMarks.delete(value);
    } else {
      cell.pencilMarks.add(value);
    }
  }

  /**
   * Get row peers for a coordinate
   */
  getRowPeers(coord: Coordinate): CellState[] {
    return getRowCoordinates(coord.row, this.config.gridSize)
      .filter((c) => c.col !== coord.col)
      .map((c) => this.getCell(c)!)
      .filter(Boolean);
  }

  /**
   * Get column peers for a coordinate
   */
  getColPeers(coord: Coordinate): CellState[] {
    return getColCoordinates(coord.col, this.config.gridSize)
      .filter((c) => c.row !== coord.row)
      .map((c) => this.getCell(c)!)
      .filter(Boolean);
  }

  /**
   * Get box peers for a coordinate
   */
  getBoxPeers(coord: Coordinate): CellState[] {
    const boxIndex = getBoxIndex(
      coord.row,
      coord.col,
      this.config.boxWidth
    );
    return getBoxCoordinates(boxIndex, this.config.gridSize)
      .filter((c) => c.row !== coord.row || c.col !== coord.col)
      .map((c) => this.getCell(c)!)
      .filter(Boolean);
  }

  /**
   * Get all peers for a coordinate
   */
  getAllPeers(coord: Coordinate): CellState[] {
    return getPeerCoordinates(coord, this.config.gridSize)
      .map((c) => this.getCell(c)!)
      .filter(Boolean);
  }

  /**
   * Get all units (rows, columns, boxes)
   */
  getAllUnits(): CellState[][] {
    const units: CellState[][] = [];

    // Rows
    for (let row = 0; row < this.config.gridSize; row++) {
      const rowCells = getRowCoordinates(row, this.config.gridSize)
        .map((c) => this.getCell(c)!)
        .filter(Boolean);
      units.push(rowCells);
    }

    // Columns
    for (let col = 0; col < this.config.gridSize; col++) {
      const colCells = getColCoordinates(col, this.config.gridSize)
        .map((c) => this.getCell(c)!)
        .filter(Boolean);
      units.push(colCells);
    }

    // Boxes
    const numBoxes = this.config.boxWidth * this.config.boxHeight;
    for (let box = 0; box < numBoxes; box++) {
      const boxCells = getBoxCoordinates(box, this.config.gridSize)
        .map((c) => this.getCell(c)!)
        .filter(Boolean);
      units.push(boxCells);
    }

    return units;
  }

  /**
   * Check if a value placement is valid
   */
  isValidPlacement(coord: Coordinate, value: number): boolean {
    const peers = this.getAllPeers(coord);
    return !peers.some((peer) => peer.value === value);
  }

  /**
   * Get conflicting coordinates for a cell
   */
  getConflicts(coord: Coordinate): Coordinate[] {
    const cell = this.getCell(coord);
    if (!cell || cell.value === null) return [];

    return this.getAllPeers(coord)
      .filter((peer) => peer.value === cell.value)
      .map((peer) => peer.coordinate);
  }

  /**
   * Check if the grid is solved
   */
  isSolved(): boolean {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length > 0) return false;

    // Check all units are valid
    for (const unit of this.getAllUnits()) {
      const values = unit.map((c) => c.value).filter((v) => v !== null);
      const uniqueValues = new Set(values);
      if (uniqueValues.size !== this.config.gridSize) return false;
    }

    return true;
  }

  /**
   * Check if the grid has any conflicts
   */
  hasConflicts(): boolean {
    for (const cell of this.getFilledCells()) {
      if (this.getConflicts(cell.coordinate).length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculate possible values for all cells.
   * Uses constraint propagation to eliminate values that are
   * logically forced in peer cells (naked singles).
   */
  calculatePossibleValues(): void {
    // Step 1: Basic elimination based on placed values
    for (const cell of this.cells.values()) {
      if (cell.value !== null) {
        cell.possibleValues.clear();
        continue;
      }

      const peerValues = new Set(
        this.getAllPeers(cell.coordinate)
          .map((p) => p.value)
          .filter((v): v is number => v !== null)
      );

      cell.possibleValues.clear();
      for (let v = 1; v <= this.config.maxValue; v++) {
        if (!peerValues.has(v)) {
          cell.possibleValues.add(v);
        }
      }
    }

    // Step 2: Propagate constraints from naked singles
    // If a cell has only one possible value, eliminate it from peers
    let changed = true;
    while (changed) {
      changed = false;

      for (const cell of this.cells.values()) {
        if (cell.value === null && cell.possibleValues.size === 1) {
          const forcedValue = Array.from(cell.possibleValues)[0];

          // Eliminate this value from all peers
          for (const peer of this.getAllPeers(cell.coordinate)) {
            if (peer.value === null && peer.possibleValues.has(forcedValue)) {
              peer.possibleValues.delete(forcedValue);
              changed = true;
            }
          }
        }
      }

      // Also check hidden singles: if a value can only go in one place in a unit
      for (const unit of this.getAllUnits()) {
        for (let value = 1; value <= this.config.maxValue; value++) {
          // Skip if value is already placed
          if (unit.some((c) => c.value === value)) {
            continue;
          }

          // Find cells where this value is still possible
          const possibleCells = unit.filter(
            (c) => c.value === null && c.possibleValues.has(value)
          );

          // If only one cell can have this value, it's forced
          // Remove all other possibilities from that cell
          if (possibleCells.length === 1) {
            const forcedCell = possibleCells[0];
            if (forcedCell.possibleValues.size > 1) {
              forcedCell.possibleValues.clear();
              forcedCell.possibleValues.add(value);
              changed = true;
            }
          }
        }
      }
    }
  }

  /**
   * Validate all cells and mark conflicts
   */
  validateAll(): void {
    for (const cell of this.cells.values()) {
      if (cell.value === null) {
        cell.isValid = true;
      } else {
        cell.isValid = this.getConflicts(cell.coordinate).length === 0;
      }
    }
  }

  /**
   * Create a snapshot of the current state
   */
  createSnapshot(): PuzzleSnapshot {
    return {
      cells: cloneCellsMap(this.cells),
      timestamp: Date.now(),
    };
  }

  /**
   * Restore from a snapshot
   */
  restoreSnapshot(snapshot: PuzzleSnapshot): void {
    this.cells = cloneCellsMap(snapshot.cells);
  }

  /**
   * Clone the grid
   */
  clone(): Grid {
    const cloned = new Grid(this.config.gridSize);
    cloned.cells = cloneCellsMap(this.cells);
    return cloned;
  }

  /**
   * Convert to a solution object
   */
  toSolution(): Solution {
    const values = new Map<string, number>();
    for (const cell of this.cells.values()) {
      if (cell.value !== null) {
        values.set(cell.id, cell.value);
      }
    }
    return { values };
  }

  /**
   * Apply a solution to the grid
   */
  applySolution(solution: Solution): void {
    for (const [id, value] of solution.values) {
      const cell = this.cells.get(id);
      if (cell && !cell.isGiven) {
        cell.value = value;
      }
    }
    this.validateAll();
    this.calculatePossibleValues();
  }

  /**
   * Convert to 2D array
   */
  toArray(): CellValue[][] {
    const arr: CellValue[][] = [];
    for (let row = 0; row < this.config.gridSize; row++) {
      const rowArr: CellValue[] = [];
      for (let col = 0; col < this.config.gridSize; col++) {
        const cell = this.getCell({ row, col });
        rowArr.push(cell?.value ?? null);
      }
      arr.push(rowArr);
    }
    return arr;
  }

  /**
   * Load from 2D array
   */
  fromArray(values: CellValue[][], asGiven: boolean = false): void {
    for (let row = 0; row < Math.min(values.length, this.config.gridSize); row++) {
      for (let col = 0; col < Math.min(values[row].length, this.config.gridSize); col++) {
        const value = values[row][col];
        if (value !== null && value >= 1 && value <= this.config.maxValue) {
          if (asGiven) {
            this.setGiven({ row, col }, value);
          } else {
            this.setValue({ row, col }, value);
          }
        }
      }
    }
    this.validateAll();
    this.calculatePossibleValues();
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    let result = "";
    for (let row = 0; row < this.config.gridSize; row++) {
      for (let col = 0; col < this.config.gridSize; col++) {
        const cell = this.getCell({ row, col });
        if (cell?.value !== null) {
          if (cell.value <= 9) {
            result += String(cell.value);
          } else {
            result += String.fromCharCode(55 + cell.value);
          }
        } else {
          result += ".";
        }
      }
    }
    return result;
  }

  /**
   * Load from string representation
   */
  fromString(str: string, asGiven: boolean = false): void {
    const cleaned = str.replace(/\s+/g, "").toUpperCase();
    let index = 0;

    for (let row = 0; row < this.config.gridSize && index < cleaned.length; row++) {
      for (let col = 0; col < this.config.gridSize && index < cleaned.length; col++) {
        const char = cleaned[index++];
        let value: number | null = null;

        if (char >= "1" && char <= "9") {
          value = parseInt(char, 10);
        } else if (char >= "A" && char <= "Z") {
          value = char.charCodeAt(0) - 55;
        }

        if (value !== null && value >= 1 && value <= this.config.maxValue) {
          if (asGiven) {
            this.setGiven({ row, col }, value);
          } else {
            this.setValue({ row, col }, value);
          }
        }
      }
    }
    this.validateAll();
    this.calculatePossibleValues();
  }

  /**
   * Reset the grid (clear non-given cells)
   */
  reset(): void {
    for (const cell of this.cells.values()) {
      if (!cell.isGiven) {
        cell.value = null;
        cell.pencilMarks.clear();
        cell.isValid = true;
      }
    }
    this.calculatePossibleValues();
  }

  /**
   * Clear the entire grid
   */
  clear(): void {
    for (const cell of this.cells.values()) {
      cell.value = null;
      cell.isGiven = false;
      cell.pencilMarks.clear();
      cell.isValid = true;
    }
    this.calculatePossibleValues();
  }

  /**
   * Get the cells map (for state management)
   */
  getCellsMap(): Map<string, CellState> {
    return this.cells;
  }
}
