/**
 * Backtracking Solver
 *
 * Uses backtracking search with MRV (Minimum Remaining Values) heuristic
 * and LCV (Least Constraining Value) ordering for efficiency.
 */

import { Grid } from "../models/Grid";
import { ConstraintPropagation } from "./ConstraintPropagation";
import type { CellState, Solution } from "../models/types";

export interface BacktrackerOptions {
  maxSolutions?: number;
  maxNodes?: number;
  maxTimeMs?: number;
  abortSignal?: AbortSignal;
}

export class Backtracker {
  private solutions: Solution[] = [];
  private nodesExplored = 0;
  private startTime = 0;
  private propagator = new ConstraintPropagation();

  /**
   * Search for solutions using backtracking.
   * Returns an array of solutions (up to maxSolutions).
   */
  search(grid: Grid, options: BacktrackerOptions = {}): Solution[] {
    const {
      maxSolutions = 1,
      maxNodes = 10_000_000,
      maxTimeMs = 30_000,
      abortSignal,
    } = options;

    this.solutions = [];
    this.nodesExplored = 0;
    this.startTime = performance.now();

    const workingGrid = grid.clone();
    workingGrid.calculatePossibleValues();

    this.backtrack(workingGrid, {
      maxSolutions,
      maxNodes,
      maxTimeMs,
      abortSignal,
    });

    return this.solutions;
  }

  /**
   * Get statistics from the last search
   */
  getStats(): { nodesExplored: number; timeElapsed: number } {
    return {
      nodesExplored: this.nodesExplored,
      timeElapsed: performance.now() - this.startTime,
    };
  }

  private backtrack(grid: Grid, options: BacktrackerOptions): boolean {
    // Check abort signal
    if (options.abortSignal?.aborted) {
      return false;
    }

    // Check limits
    if (this.shouldStop(options)) {
      return false;
    }

    this.nodesExplored++;

    // Check if solved
    if (grid.isSolved()) {
      this.solutions.push(grid.toSolution());
      return this.solutions.length < (options.maxSolutions ?? 1);
    }

    // Select the best cell to fill (MRV heuristic)
    const cell = this.selectNextCell(grid);
    if (!cell) {
      return true; // No empty cells but not solved - shouldn't happen
    }

    // Try each possible value (ordered by LCV)
    const orderedValues = this.orderValues(cell, grid);

    for (const value of orderedValues) {
      const snapshot = grid.createSnapshot();

      // Try this value
      grid.setValue(cell.coordinate, value);
      grid.calculatePossibleValues();

      // Propagate constraints
      if (this.propagator.propagate(grid)) {
        // Continue search
        const shouldContinue = this.backtrack(grid, options);
        if (!shouldContinue) {
          grid.restoreSnapshot(snapshot);
          return false;
        }
      }

      // Restore and try next value
      grid.restoreSnapshot(snapshot);
    }

    return true;
  }

  private shouldStop(options: BacktrackerOptions): boolean {
    const { maxSolutions = 1, maxNodes = 10_000_000, maxTimeMs = 30_000 } = options;

    return (
      this.solutions.length >= maxSolutions ||
      this.nodesExplored >= maxNodes ||
      performance.now() - this.startTime >= maxTimeMs
    );
  }

  /**
   * Select the next cell to fill using MRV heuristic.
   * Chooses the cell with the fewest possible values.
   */
  private selectNextCell(grid: Grid): CellState | null {
    let minCount = Infinity;
    let selected: CellState | null = null;

    for (const cell of grid.getEmptyCells()) {
      const count = cell.possibleValues.size;

      if (count < minCount) {
        minCount = count;
        selected = cell;

        // Can't do better than 1
        if (minCount === 1) {
          break;
        }
      }
    }

    return selected;
  }

  /**
   * Order values using LCV heuristic.
   * Tries values that eliminate fewer possibilities from peers first.
   */
  private orderValues(cell: CellState, grid: Grid): number[] {
    const values = Array.from(cell.possibleValues);

    // For small possibility sets, don't bother ordering
    if (values.length <= 2) {
      return values;
    }

    // Sort by least constraining value
    return values.sort((a, b) => {
      const constraintsA = this.countConstraints(cell, a, grid);
      const constraintsB = this.countConstraints(cell, b, grid);
      return constraintsA - constraintsB;
    });
  }

  /**
   * Count how many peer possibilities would be eliminated by placing a value.
   */
  private countConstraints(cell: CellState, value: number, grid: Grid): number {
    let count = 0;

    for (const peer of grid.getAllPeers(cell.coordinate)) {
      if (peer.value === null && peer.possibleValues.has(value)) {
        count++;
      }
    }

    return count;
  }
}
