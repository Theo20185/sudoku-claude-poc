/**
 * Main Solver Class
 *
 * Provides a unified interface for solving Sudoku puzzles.
 */

import { Grid } from "../models/Grid";
import { ConstraintPropagation } from "./ConstraintPropagation";
import { Backtracker } from "./Backtracker";
import { AllSolutionsFinder } from "./AllSolutionsFinder";
import type { Solution, FindAllOptions, SolverResult } from "../models/types";

export class Solver {
  private propagator = new ConstraintPropagation();
  private backtracker = new Backtracker();
  private allFinder = new AllSolutionsFinder();

  /**
   * Find a single solution to the puzzle.
   * Returns null if no solution exists.
   */
  solve(grid: Grid): Solution | null {
    const workingGrid = grid.clone();
    workingGrid.calculatePossibleValues();

    // Phase 1: Constraint propagation
    if (!this.propagator.propagate(workingGrid)) {
      return null; // Contradiction found
    }

    // Check if already solved
    if (workingGrid.isSolved()) {
      return workingGrid.toSolution();
    }

    // Phase 2: Backtracking
    const solutions = this.backtracker.search(workingGrid, { maxSolutions: 1 });
    return solutions.length > 0 ? solutions[0] : null;
  }

  /**
   * Check if the puzzle has a unique solution.
   */
  hasUniqueSolution(grid: Grid): boolean {
    const result = this.allFinder.find(grid, { maxSolutions: 2 });
    return result.totalFound === 1;
  }

  /**
   * Check if the puzzle is solvable.
   */
  isSolvable(grid: Grid): boolean {
    return this.solve(grid) !== null;
  }

  /**
   * Find all solutions to the puzzle with safety limits.
   */
  findAllSolutions(
    grid: Grid,
    options?: Partial<FindAllOptions>
  ): SolverResult {
    return this.allFinder.find(grid, options);
  }

  /**
   * Find all solutions asynchronously with progress updates.
   */
  async findAllSolutionsAsync(
    grid: Grid,
    options?: Partial<FindAllOptions>
  ): Promise<SolverResult> {
    return this.allFinder.findAsync(grid, options);
  }

  /**
   * Get cells that can be filled with 100% confidence.
   * These are cells where only one value is possible.
   */
  getConfidentMoves(grid: Grid): Map<string, number> {
    const moves = new Map<string, number>();
    const workingGrid = grid.clone();
    workingGrid.calculatePossibleValues();

    // Apply constraint propagation to find more confident moves
    this.propagator.propagate(workingGrid);

    for (const cell of workingGrid.getEmptyCells()) {
      if (cell.possibleValues.size === 1) {
        const value = Array.from(cell.possibleValues)[0];
        moves.set(cell.id, value);
      }
    }

    return moves;
  }

  /**
   * Step through solving one cell at a time (for visualization).
   * Returns the cell ID and value that was filled, or null if stuck.
   */
  solveStep(grid: Grid): { cellId: string; value: number } | null {
    const workingGrid = grid.clone();
    workingGrid.calculatePossibleValues();

    // Try to find a naked single
    for (const cell of workingGrid.getEmptyCells()) {
      if (cell.possibleValues.size === 1) {
        const value = Array.from(cell.possibleValues)[0];
        return { cellId: cell.id, value };
      }
    }

    // Try to find a hidden single
    for (const unit of workingGrid.getAllUnits()) {
      for (let value = 1; value <= workingGrid.config.maxValue; value++) {
        if (unit.some((c) => c.value === value)) {
          continue;
        }

        const possibleCells = unit.filter(
          (cell) => cell.value === null && cell.possibleValues.has(value)
        );

        if (possibleCells.length === 1) {
          return { cellId: possibleCells[0].id, value };
        }
      }
    }

    return null;
  }

  /**
   * Get hint for a specific cell.
   * Returns possible values and reasoning.
   */
  getHint(
    grid: Grid,
    cellId: string
  ): { possibleValues: number[]; confident: boolean } {
    const workingGrid = grid.clone();
    workingGrid.calculatePossibleValues();

    const cell = workingGrid.getCellById(cellId);
    if (!cell || cell.value !== null) {
      return { possibleValues: [], confident: false };
    }

    return {
      possibleValues: Array.from(cell.possibleValues).sort((a, b) => a - b),
      confident: cell.possibleValues.size === 1,
    };
  }

  /**
   * Validate the current grid state.
   */
  validate(grid: Grid): { valid: boolean; conflicts: string[] } {
    const conflicts: string[] = [];

    for (const cell of grid.getFilledCells()) {
      const cellConflicts = grid.getConflicts(cell.coordinate);
      if (cellConflicts.length > 0) {
        conflicts.push(cell.id);
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Count solutions (up to a limit).
   */
  countSolutions(grid: Grid, limit: number = 100): number {
    const result = this.allFinder.find(grid, { maxSolutions: limit });
    return result.totalFound;
  }
}

// Export a singleton instance for convenience
export const solver = new Solver();
