/**
 * Puzzle Store
 *
 * Manages the main puzzle state using Zustand.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

// Enable Immer's MapSet plugin for Map and Set support
enableMapSet();
import { Grid } from "../core/models/Grid";
import { Solver } from "../core/solver/Solver";
import { InputValidator } from "../core/validator/InputValidator";
import { puzzleGenerator } from "../core/generator";
import { Difficulty, PuzzleStatus } from "../core/models/types";
import type {
  GridSize,
  CellValue,
  Coordinate,
  CellState,
  PuzzleSnapshot,
  Solution,
  SolverResult,
  SearchProgress,
  FindAllOptions,
} from "../core/models/types";
import {
  coordToId,
  cloneCellsMap,
  createPuzzleConfig,
} from "../core/utils/gridHelpers";

interface PuzzleStoreState {
  // Grid state
  gridSize: GridSize;
  cells: Map<string, CellState>;
  status: PuzzleStatus;

  // History for undo/redo
  history: PuzzleSnapshot[];
  historyIndex: number;

  // Solver state
  solutions: Solution[];
  currentSolutionIndex: number;
  searchProgress: SearchProgress | null;
  isSearching: boolean;
  searchResult: SolverResult | null;

  // Error state
  error: string | null;
}

interface PuzzleStoreActions {
  // Initialization
  initializePuzzle: (size: GridSize) => void;
  loadFromString: (input: string, size: GridSize) => void;
  loadRandomPuzzle: (size: GridSize, difficulty?: Difficulty) => void;
  reset: () => void;
  clear: () => void;

  // Cell operations
  setCell: (coord: Coordinate, value: CellValue) => void;
  setCellById: (id: string, value: CellValue) => void;
  toggleGiven: (coord: Coordinate) => void;
  togglePencilMark: (coord: Coordinate, value: number) => void;
  clearCell: (coord: Coordinate) => void;

  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Solver operations
  solve: () => Promise<boolean>;
  findAllSolutions: (options?: Partial<FindAllOptions>) => Promise<void>;
  autoFillConfident: () => number;
  cancelSearch: () => void;

  // Solution navigation
  showSolution: (index: number) => void;
  nextSolution: () => void;
  prevSolution: () => void;
  clearSolutions: () => void;

  // Utility
  getGrid: () => Grid;
  setError: (error: string | null) => void;
}

type PuzzleStore = PuzzleStoreState & PuzzleStoreActions;

// Abort controller for canceling searches
let searchAbortController: AbortController | null = null;

const createInitialState = (size: GridSize = 9): PuzzleStoreState => {
  const grid = new Grid(size);
  return {
    gridSize: size,
    cells: grid.getCellsMap(),
    status: PuzzleStatus.EDITING,
    history: [],
    historyIndex: -1,
    solutions: [],
    currentSolutionIndex: 0,
    searchProgress: null,
    isSearching: false,
    searchResult: null,
    error: null,
  };
};

export const usePuzzleStore = create<PuzzleStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...createInitialState(),

        initializePuzzle: (size) => {
          const grid = new Grid(size);
          set((state) => {
            state.gridSize = size;
            state.cells = grid.getCellsMap();
            state.status = PuzzleStatus.EDITING;
            state.history = [];
            state.historyIndex = -1;
            state.solutions = [];
            state.currentSolutionIndex = 0;
            state.searchProgress = null;
            state.searchResult = null;
            state.error = null;
          });
        },

        loadFromString: (input, size) => {
          const validation = InputValidator.parseTextInput(input, size);
          if (!validation.valid || !validation.values) {
            set((state) => {
              state.error = validation.error || "Invalid input";
            });
            return;
          }

          const grid = new Grid(size);
          let index = 0;
          for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
              const value = validation.values[index++];
              if (value !== null) {
                grid.setGiven({ row, col }, value);
              }
            }
          }
          grid.calculatePossibleValues();
          grid.validateAll();

          set((state) => {
            state.gridSize = size;
            state.cells = grid.getCellsMap();
            state.status = PuzzleStatus.SOLVING;
            state.history = [];
            state.historyIndex = -1;
            state.solutions = [];
            state.error = null;
          });
        },

        loadRandomPuzzle: (size, difficulty = Difficulty.MEDIUM) => {
          const puzzleString = puzzleGenerator.generate(size, difficulty);
          get().loadFromString(puzzleString, size);
        },

        reset: () => {
          const { gridSize, cells } = get();
          const grid = new Grid(gridSize);

          // Copy cells and reset non-given values
          for (const [id, cell] of cells) {
            if (cell.isGiven && cell.value !== null) {
              grid.setGiven(cell.coordinate, cell.value);
            }
          }
          grid.calculatePossibleValues();

          set((state) => {
            state.cells = grid.getCellsMap();
            state.status = PuzzleStatus.SOLVING;
            state.solutions = [];
            state.currentSolutionIndex = 0;
          });
        },

        clear: () => {
          const { gridSize } = get();
          const grid = new Grid(gridSize);
          set((state) => {
            state.cells = grid.getCellsMap();
            state.status = PuzzleStatus.EDITING;
            state.history = [];
            state.historyIndex = -1;
            state.solutions = [];
            state.error = null;
          });
        },

        setCell: (coord, value) => {
          console.log("setCell called with:", coord, value);
          const { gridSize, cells } = get();
          const validation = InputValidator.validateCellValue(value, gridSize);
          console.log("Validation result:", validation);
          if (!validation.valid) {
            set((state) => {
              state.error = validation.error || "Invalid value";
            });
            return;
          }

          const id = coordToId(coord);
          const cell = cells.get(id);
          console.log("Cell lookup:", id, "found:", !!cell, "isGiven:", cell?.isGiven);

          // Check if we can modify this cell
          if (!cell || cell.isGiven) {
            console.log("Cannot modify cell - returning early");
            return;
          }

          // Save to history before making changes
          get().saveToHistory();

          // Create updated grid with new value
          const grid = get().getGrid();
          grid.setValue(coord, validation.sanitized);
          if (validation.sanitized !== null) {
            const gridCell = grid.getCell(coord);
            if (gridCell) {
              gridCell.pencilMarks.clear();
            }
          }
          grid.calculatePossibleValues();
          grid.validateAll();

          // Determine new status
          let newStatus = PuzzleStatus.SOLVING;
          if (grid.isSolved()) {
            newStatus = PuzzleStatus.SOLVED;
          } else if (grid.hasConflicts()) {
            newStatus = PuzzleStatus.INVALID;
          }

          set((state) => {
            state.cells = grid.getCellsMap();
            state.status = newStatus;
          });
        },

        setCellById: (id, value) => {
          const cell = get().cells.get(id);
          if (cell) {
            get().setCell(cell.coordinate, value);
          }
        },

        toggleGiven: (coord) => {
          const id = coordToId(coord);
          set((state) => {
            const cell = state.cells.get(id);
            if (cell && cell.value !== null) {
              cell.isGiven = !cell.isGiven;
            }
          });
        },

        togglePencilMark: (coord, value) => {
          const id = coordToId(coord);
          set((state) => {
            const cell = state.cells.get(id);
            if (cell && cell.value === null) {
              if (cell.pencilMarks.has(value)) {
                cell.pencilMarks.delete(value);
              } else {
                cell.pencilMarks.add(value);
              }
            }
          });
        },

        clearCell: (coord) => {
          const id = coordToId(coord);
          const { cells } = get();
          const cell = cells.get(id);

          // Check if we can clear this cell
          if (!cell || cell.isGiven) {
            return;
          }

          // Save to history before making changes
          get().saveToHistory();

          // Create updated grid with cleared cell
          const grid = get().getGrid();
          grid.clearCell(coord);
          grid.calculatePossibleValues();
          grid.validateAll();

          set((state) => {
            state.cells = grid.getCellsMap();
            state.status = PuzzleStatus.SOLVING;
          });
        },

        saveToHistory: () => {
          set((state) => {
            const snapshot: PuzzleSnapshot = {
              cells: cloneCellsMap(state.cells),
              timestamp: Date.now(),
            };

            // Trim future history if we're not at the end
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push(snapshot);
            state.historyIndex = state.history.length - 1;

            // Limit history size
            const MAX_HISTORY = 100;
            if (state.history.length > MAX_HISTORY) {
              state.history = state.history.slice(-MAX_HISTORY);
              state.historyIndex = state.history.length - 1;
            }
          });
        },

        undo: () => {
          set((state) => {
            if (state.historyIndex > 0) {
              state.historyIndex--;
              const snapshot = state.history[state.historyIndex];
              state.cells = cloneCellsMap(snapshot.cells);
            }
          });
        },

        redo: () => {
          set((state) => {
            if (state.historyIndex < state.history.length - 1) {
              state.historyIndex++;
              const snapshot = state.history[state.historyIndex];
              state.cells = cloneCellsMap(snapshot.cells);
            }
          });
        },

        solve: async () => {
          const grid = get().getGrid();
          const solver = new Solver();
          const solution = solver.solve(grid);

          if (solution) {
            set((state) => {
              state.solutions = [solution];
              state.currentSolutionIndex = 0;
            });
            get().showSolution(0);
            return true;
          }

          set((state) => {
            state.status = PuzzleStatus.NO_SOLUTION;
            state.error = "No solution found";
          });
          return false;
        },

        findAllSolutions: async (options = {}) => {
          const grid = get().getGrid();

          // Cancel any existing search
          if (searchAbortController) {
            searchAbortController.abort();
          }
          searchAbortController = new AbortController();

          set((state) => {
            state.isSearching = true;
            state.searchProgress = null;
            state.error = null;
          });

          try {
            const solver = new Solver();
            const result = await solver.findAllSolutionsAsync(grid, {
              maxSolutions: options.maxSolutions ?? 1000,
              maxTimeMs: options.maxTimeMs ?? 30000,
              maxNodes: options.maxNodes ?? 10_000_000,
              abortSignal: searchAbortController.signal,
              onProgress: (progress) => {
                set((state) => {
                  state.searchProgress = progress;
                });
              },
            });

            set((state) => {
              state.solutions = result.solutions;
              state.currentSolutionIndex = 0;
              state.searchResult = result;
              state.isSearching = false;

              if (result.solutions.length === 0) {
                state.status = PuzzleStatus.NO_SOLUTION;
              }
            });
          } catch (error) {
            set((state) => {
              state.error =
                error instanceof Error ? error.message : "Search failed";
              state.isSearching = false;
            });
          }

          searchAbortController = null;
        },

        autoFillConfident: () => {
          const grid = get().getGrid();
          const solver = new Solver();
          const confidentMoves = solver.getConfidentMoves(grid);

          if (confidentMoves.size === 0) {
            return 0;
          }

          get().saveToHistory();

          set((state) => {
            for (const [id, value] of confidentMoves) {
              const cell = state.cells.get(id);
              if (cell && !cell.isGiven) {
                cell.value = value;
                cell.pencilMarks.clear();
              }
            }

            // Recalculate
            const grid = get().getGrid();
            grid.calculatePossibleValues();
            grid.validateAll();
            state.cells = grid.getCellsMap();

            if (grid.isSolved()) {
              state.status = PuzzleStatus.SOLVED;
            }
          });

          return confidentMoves.size;
        },

        cancelSearch: () => {
          if (searchAbortController) {
            searchAbortController.abort();
            searchAbortController = null;
          }
          set((state) => {
            state.isSearching = false;
          });
        },

        showSolution: (index) => {
          const { solutions } = get();
          if (index < 0 || index >= solutions.length) return;

          const solution = solutions[index];

          set((state) => {
            // Apply solution values to non-given cells
            for (const [id, value] of solution.values) {
              const cell = state.cells.get(id);
              if (cell && !cell.isGiven) {
                cell.value = value;
                cell.pencilMarks.clear();
              }
            }
            state.currentSolutionIndex = index;
            state.status = PuzzleStatus.SOLVED;
          });
        },

        nextSolution: () => {
          const { currentSolutionIndex, solutions } = get();
          if (currentSolutionIndex < solutions.length - 1) {
            get().showSolution(currentSolutionIndex + 1);
          }
        },

        prevSolution: () => {
          const { currentSolutionIndex } = get();
          if (currentSolutionIndex > 0) {
            get().showSolution(currentSolutionIndex - 1);
          }
        },

        clearSolutions: () => {
          set((state) => {
            state.solutions = [];
            state.currentSolutionIndex = 0;
            state.searchResult = null;
          });
        },

        getGrid: () => {
          const { gridSize, cells } = get();
          const grid = new Grid(gridSize);

          // Copy cell values
          for (const [id, cell] of cells) {
            const gridCell = grid.getCellById(id);
            if (gridCell) {
              gridCell.value = cell.value;
              gridCell.isGiven = cell.isGiven;
              gridCell.pencilMarks = new Set(cell.pencilMarks);
            }
          }

          grid.calculatePossibleValues();
          grid.validateAll();
          return grid;
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },
      })),
      {
        name: "sudoku-puzzle",
        partialize: (state) => ({
          gridSize: state.gridSize,
          cells: Array.from(state.cells.entries()).map(([id, cell]) => ({
            id,
            value: cell.value,
            isGiven: cell.isGiven,
            pencilMarks: Array.from(cell.pencilMarks),
          })),
        }),
        merge: (persisted, current) => {
          // Restore from persisted state
          if (persisted && typeof persisted === "object") {
            const p = persisted as {
              gridSize?: GridSize;
              cells?: Array<{
                id: string;
                value: CellValue;
                isGiven: boolean;
                pencilMarks: number[];
              }>;
            };

            if (p.gridSize && p.cells) {
              const grid = new Grid(p.gridSize);
              for (const cellData of p.cells) {
                const cell = grid.getCellById(cellData.id);
                if (cell) {
                  cell.value = cellData.value;
                  cell.isGiven = cellData.isGiven;
                  cell.pencilMarks = new Set(cellData.pencilMarks);
                }
              }
              grid.calculatePossibleValues();
              grid.validateAll();

              return {
                ...current,
                gridSize: p.gridSize,
                cells: grid.getCellsMap(),
                status: grid.isSolved()
                  ? PuzzleStatus.SOLVED
                  : grid.hasConflicts()
                  ? PuzzleStatus.INVALID
                  : PuzzleStatus.SOLVING,
              };
            }
          }
          return current;
        },
      }
    ),
    { name: "PuzzleStore" }
  )
);
