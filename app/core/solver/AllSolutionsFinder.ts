/**
 * All Solutions Finder
 *
 * Safely finds all solutions to a puzzle with configurable limits
 * to prevent infinite loops and memory overflow.
 */

import { Grid } from "../models/Grid";
import { ConstraintPropagation } from "./ConstraintPropagation";
import type {
  CellState,
  Solution,
  FindAllOptions,
  SolverResult,
  SearchProgress,
} from "../models/types";

const DEFAULT_OPTIONS: FindAllOptions = {
  maxSolutions: 1000,
  maxTimeMs: 30_000,
  maxNodes: 10_000_000,
};

export class AllSolutionsFinder {
  private solutions: Solution[] = [];
  private nodesExplored = 0;
  private startTime = 0;
  private propagator = new ConstraintPropagation();
  private lastProgressTime = 0;

  /**
   * Find all solutions to a puzzle with safety limits.
   */
  find(grid: Grid, options: Partial<FindAllOptions> = {}): SolverResult {
    const mergedOptions: FindAllOptions = { ...DEFAULT_OPTIONS, ...options };

    this.reset();
    this.startTime = performance.now();
    this.lastProgressTime = this.startTime;

    const workingGrid = grid.clone();
    workingGrid.calculatePossibleValues();

    // Initial constraint propagation
    if (!this.propagator.propagate(workingGrid)) {
      return this.buildResult(false);
    }

    // Check if already solved
    if (workingGrid.isSolved()) {
      this.solutions.push(workingGrid.toSolution());
      return this.buildResult(false);
    }

    // Start recursive search
    this.searchRecursive(workingGrid, mergedOptions);

    return this.buildResult(this.checkLimitsReached(mergedOptions));
  }

  /**
   * Find solutions asynchronously with progress updates.
   * Uses setTimeout to yield to the event loop periodically.
   */
  async findAsync(
    grid: Grid,
    options: Partial<FindAllOptions> = {}
  ): Promise<SolverResult> {
    const mergedOptions: FindAllOptions = { ...DEFAULT_OPTIONS, ...options };

    this.reset();
    this.startTime = performance.now();
    this.lastProgressTime = this.startTime;

    const workingGrid = grid.clone();
    workingGrid.calculatePossibleValues();

    // Initial constraint propagation
    if (!this.propagator.propagate(workingGrid)) {
      return this.buildResult(false);
    }

    // Check if already solved
    if (workingGrid.isSolved()) {
      this.solutions.push(workingGrid.toSolution());
      return this.buildResult(false);
    }

    // Start async search
    await this.searchAsync(workingGrid, mergedOptions);

    return this.buildResult(this.checkLimitsReached(mergedOptions));
  }

  private reset(): void {
    this.solutions = [];
    this.nodesExplored = 0;
    this.startTime = 0;
    this.lastProgressTime = 0;
  }

  private searchRecursive(grid: Grid, options: FindAllOptions): boolean {
    // Check abort signal
    if (options.abortSignal?.aborted) {
      return false;
    }

    // Check limits
    if (this.shouldStop(options)) {
      return false;
    }

    this.nodesExplored++;

    // Report progress periodically
    this.reportProgress(options);

    // Check if solved
    if (grid.isSolved()) {
      this.solutions.push(grid.toSolution());
      return this.solutions.length < options.maxSolutions;
    }

    // Select cell with minimum remaining values (MRV)
    const cell = this.selectNextCell(grid);
    if (!cell) {
      return true;
    }

    // No possible values - dead end
    if (cell.possibleValues.size === 0) {
      return true;
    }

    // Try each possible value
    const orderedValues = this.orderValues(cell, grid);

    for (const value of orderedValues) {
      const snapshot = grid.createSnapshot();

      grid.setValue(cell.coordinate, value);
      grid.calculatePossibleValues();

      // Propagate constraints
      if (this.propagator.propagate(grid)) {
        const shouldContinue = this.searchRecursive(grid, options);
        if (!shouldContinue) {
          grid.restoreSnapshot(snapshot);
          return false;
        }
      }

      grid.restoreSnapshot(snapshot);
    }

    return true;
  }

  private async searchAsync(grid: Grid, options: FindAllOptions): Promise<boolean> {
    // Use a stack-based iterative approach for async
    const stack: Array<{
      grid: Grid;
      valueIndex: number;
      orderedValues: number[];
      cell: CellState;
      snapshot: ReturnType<Grid["createSnapshot"]>;
    }> = [];

    // Initialize with the first cell
    grid.calculatePossibleValues();
    const initialCell = this.selectNextCell(grid);
    if (!initialCell) return true;

    stack.push({
      grid: grid.clone(),
      valueIndex: 0,
      orderedValues: this.orderValues(initialCell, grid),
      cell: initialCell,
      snapshot: grid.createSnapshot(),
    });

    let iterations = 0;
    const YIELD_INTERVAL = 1000;

    while (stack.length > 0) {
      // Check abort
      if (options.abortSignal?.aborted) {
        return false;
      }

      // Check limits
      if (this.shouldStop(options)) {
        return false;
      }

      // Yield to event loop periodically
      iterations++;
      if (iterations % YIELD_INTERVAL === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const current = stack[stack.length - 1];

      // Check if we've tried all values for this cell
      if (current.valueIndex >= current.orderedValues.length) {
        stack.pop();
        continue;
      }

      this.nodesExplored++;
      this.reportProgress(options);

      const value = current.orderedValues[current.valueIndex];
      current.valueIndex++;

      // Try this value
      const workingGrid = current.grid.clone();
      workingGrid.restoreSnapshot(current.snapshot);
      workingGrid.setValue(current.cell.coordinate, value);
      workingGrid.calculatePossibleValues();

      // Propagate constraints
      if (this.propagator.propagate(workingGrid)) {
        // Check if solved
        if (workingGrid.isSolved()) {
          this.solutions.push(workingGrid.toSolution());
          if (this.solutions.length >= options.maxSolutions) {
            return false;
          }
          continue;
        }

        // Continue to next cell
        const nextCell = this.selectNextCell(workingGrid);
        if (nextCell && nextCell.possibleValues.size > 0) {
          stack.push({
            grid: workingGrid,
            valueIndex: 0,
            orderedValues: this.orderValues(nextCell, workingGrid),
            cell: nextCell,
            snapshot: workingGrid.createSnapshot(),
          });
        }
      }
    }

    return true;
  }

  private shouldStop(options: FindAllOptions): boolean {
    return (
      this.solutions.length >= options.maxSolutions ||
      this.nodesExplored >= options.maxNodes ||
      performance.now() - this.startTime >= options.maxTimeMs
    );
  }

  private checkLimitsReached(options: FindAllOptions): boolean {
    return (
      this.nodesExplored >= options.maxNodes ||
      performance.now() - this.startTime >= options.maxTimeMs
    );
  }

  private reportProgress(options: FindAllOptions): void {
    const now = performance.now();

    // Report every 100ms or every 10000 nodes
    if (
      options.onProgress &&
      (now - this.lastProgressTime >= 100 || this.nodesExplored % 10000 === 0)
    ) {
      this.lastProgressTime = now;

      const progress: SearchProgress = {
        nodesExplored: this.nodesExplored,
        solutionsFound: this.solutions.length,
        timeElapsed: now - this.startTime,
      };

      options.onProgress(progress);
    }
  }

  private selectNextCell(grid: Grid): CellState | null {
    let minCount = Infinity;
    let selected: CellState | null = null;

    for (const cell of grid.getEmptyCells()) {
      const count = cell.possibleValues.size;

      if (count < minCount) {
        minCount = count;
        selected = cell;

        if (minCount === 1) {
          break;
        }
      }
    }

    return selected;
  }

  private orderValues(cell: CellState, grid: Grid): number[] {
    const values = Array.from(cell.possibleValues);

    if (values.length <= 2) {
      return values;
    }

    return values.sort((a, b) => {
      const constraintsA = this.countConstraints(cell, a, grid);
      const constraintsB = this.countConstraints(cell, b, grid);
      return constraintsA - constraintsB;
    });
  }

  private countConstraints(cell: CellState, value: number, grid: Grid): number {
    let count = 0;

    for (const peer of grid.getAllPeers(cell.coordinate)) {
      if (peer.value === null && peer.possibleValues.has(value)) {
        count++;
      }
    }

    return count;
  }

  private buildResult(limitReached: boolean): SolverResult {
    return {
      solutions: this.solutions,
      totalFound: this.solutions.length,
      searchLimitReached: limitReached,
      timeElapsed: performance.now() - this.startTime,
      nodesExplored: this.nodesExplored,
    };
  }
}
