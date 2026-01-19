/**
 * Puzzle Generator
 *
 * Generates random Sudoku puzzles with unique solutions.
 */

import { Grid } from "../models/Grid";
import { Solver } from "../solver/Solver";
import { Difficulty } from "../models/types";
import type { GridSize } from "../models/types";

/**
 * Configuration for puzzle generation based on difficulty.
 * These control the target number of clues for each difficulty level.
 */
const DIFFICULTY_CLUES: Record<Difficulty, Record<GridSize, { min: number; max: number }>> = {
  [Difficulty.EASY]: {
    4: { min: 8, max: 10 },
    9: { min: 36, max: 45 },
    16: { min: 120, max: 150 },
    25: { min: 300, max: 380 },
  },
  [Difficulty.MEDIUM]: {
    4: { min: 6, max: 7 },
    9: { min: 28, max: 35 },
    16: { min: 90, max: 119 },
    25: { min: 220, max: 299 },
  },
  [Difficulty.HARD]: {
    4: { min: 4, max: 5 },
    9: { min: 22, max: 27 },
    16: { min: 60, max: 89 },
    25: { min: 150, max: 219 },
  },
  [Difficulty.EXPERT]: {
    4: { min: 4, max: 4 },
    9: { min: 17, max: 21 },
    16: { min: 40, max: 59 },
    25: { min: 100, max: 149 },
  },
};

export class PuzzleGenerator {
  private solver = new Solver();

  /**
   * Generate a random puzzle with the given size and difficulty.
   * Returns the puzzle as a string.
   */
  generate(size: GridSize, difficulty: Difficulty = Difficulty.MEDIUM): string {
    // Step 1: Generate a complete valid solution
    const solution = this.generateCompleteSolution(size);

    // Step 2: Remove cells to create a puzzle with unique solution
    const puzzle = this.removeCells(solution, size, difficulty);

    return puzzle.toString();
  }

  /**
   * Generate a complete valid Sudoku solution using randomized backtracking.
   */
  private generateCompleteSolution(size: GridSize): Grid {
    const grid = new Grid(size);
    this.fillGrid(grid);
    return grid;
  }

  /**
   * Fill the grid with a complete valid solution using backtracking.
   */
  private fillGrid(grid: Grid): boolean {
    const emptyCells = grid.getEmptyCells();
    if (emptyCells.length === 0) {
      return true; // Solved
    }

    // Pick the first empty cell
    const cell = emptyCells[0];

    // Get possible values in random order
    grid.calculatePossibleValues();
    const possibleValues = Array.from(cell.possibleValues);
    this.shuffleArray(possibleValues);

    for (const value of possibleValues) {
      if (grid.isValidPlacement(cell.coordinate, value)) {
        grid.setValue(cell.coordinate, value);

        if (this.fillGrid(grid)) {
          return true;
        }

        // Backtrack
        grid.setValue(cell.coordinate, null);
      }
    }

    return false;
  }

  /**
   * Remove cells from a complete solution to create a puzzle.
   * Ensures the resulting puzzle has a unique solution.
   */
  private removeCells(solution: Grid, size: GridSize, difficulty: Difficulty): Grid {
    const puzzle = solution.clone();
    const targetClues = this.getTargetClues(size, difficulty);

    // Get all cell coordinates in random order
    const allCoords = puzzle.getAllCells().map((c) => c.coordinate);
    this.shuffleArray(allCoords);

    let currentClues = size * size;
    let attempts = 0;
    const maxAttempts = size * size * 2; // Limit attempts to avoid infinite loops

    for (const coord of allCoords) {
      if (currentClues <= targetClues || attempts >= maxAttempts) {
        break;
      }

      const cell = puzzle.getCell(coord);
      if (!cell || cell.value === null) continue;

      const savedValue = cell.value;

      // Try removing this cell
      puzzle.setValue(coord, null);

      // Check if puzzle still has unique solution
      if (this.solver.hasUniqueSolution(puzzle)) {
        currentClues--;
      } else {
        // Restore the value if removal creates multiple solutions
        puzzle.setValue(coord, savedValue);
      }

      attempts++;
    }

    // Mark remaining values as givens
    for (const cell of puzzle.getAllCells()) {
      if (cell.value !== null) {
        puzzle.setGiven(cell.coordinate, cell.value);
      }
    }

    puzzle.calculatePossibleValues();
    return puzzle;
  }

  /**
   * Get the target number of clues for a given difficulty.
   */
  private getTargetClues(size: GridSize, difficulty: Difficulty): number {
    const range = DIFFICULTY_CLUES[difficulty][size];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  /**
   * Shuffle an array in-place using Fisher-Yates algorithm.
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export const puzzleGenerator = new PuzzleGenerator();
