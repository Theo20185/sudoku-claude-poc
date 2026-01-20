/**
 * Core type definitions for the Sudoku application
 */

/** Grid size - fixed at 9x9 for standard Sudoku */
export type GridSize = 9;

/** Cell value: 1 to gridSize, or null for empty */
export type CellValue = number | null;

/** Coordinate in the grid */
export interface Coordinate {
  row: number;
  col: number;
}

/** State of a single cell */
export interface CellState {
  id: string;
  coordinate: Coordinate;
  value: CellValue;
  isGiven: boolean;
  isValid: boolean;
  possibleValues: Set<number>;
  pencilMarks: Set<number>;
  groupIndex: number;
}

/** Configuration for a puzzle */
export interface PuzzleConfig {
  gridSize: GridSize;
  boxWidth: number;
  boxHeight: number;
  minClues: number;
  maxValue: number;
}

/** Puzzle status */
export enum PuzzleStatus {
  EDITING = "editing",
  SOLVING = "solving",
  SOLVED = "solved",
  INVALID = "invalid",
  NO_SOLUTION = "no_solution",
}

/** Full puzzle state */
export interface PuzzleState {
  config: PuzzleConfig;
  cells: Map<string, CellState>;
  history: PuzzleSnapshot[];
  historyIndex: number;
  status: PuzzleStatus;
}

/** Snapshot for undo/redo */
export interface PuzzleSnapshot {
  cells: Map<string, CellState>;
  timestamp: number;
}

/** Solution representation */
export interface Solution {
  values: Map<string, number>;
}

/** Options for finding all solutions */
export interface FindAllOptions {
  maxSolutions: number;
  maxTimeMs: number;
  maxNodes: number;
  onProgress?: (progress: SearchProgress) => void;
  abortSignal?: AbortSignal;
}

/** Search progress information */
export interface SearchProgress {
  nodesExplored: number;
  solutionsFound: number;
  timeElapsed: number;
}

/** Result from the solver */
export interface SolverResult {
  solutions: Solution[];
  totalFound: number;
  searchLimitReached: boolean;
  timeElapsed: number;
  nodesExplored: number;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  values?: CellValue[];
}

/** Difficulty levels for puzzle generation */
export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

/** Theme mode */
export type ThemeMode = "light" | "dark";

/** Hints display mode */
export type HintsMode = "all" | "selected" | "none";

/** Input method */
export type InputMethod = "click" | "drag" | "keyboard";

/** Input mode (value or pencil mark) */
export type InputMode = "value" | "pencil";
