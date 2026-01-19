/**
 * Constraint Propagation Engine
 *
 * Uses naked singles and hidden singles strategies to reduce the search space.
 */

import { Grid } from "../models/Grid";
import type { CellState, Coordinate } from "../models/types";

export class ConstraintPropagation {
  /**
   * Propagate constraints through the grid.
   * Returns false if a contradiction is found.
   */
  propagate(grid: Grid): boolean {
    let changed = true;

    while (changed) {
      changed = false;

      // Strategy 1: Naked Singles
      // If a cell has only one possible value, assign it
      for (const cell of grid.getEmptyCells()) {
        if (cell.possibleValues.size === 0) {
          return false; // Contradiction
        }

        if (cell.possibleValues.size === 1) {
          const value = Array.from(cell.possibleValues)[0];
          grid.setValue(cell.coordinate, value);

          if (!this.eliminateFromPeers(cell.coordinate, value, grid)) {
            return false;
          }

          changed = true;
        }
      }

      // Strategy 2: Hidden Singles
      // If a value can only go in one cell within a unit, assign it
      for (const unit of grid.getAllUnits()) {
        for (let value = 1; value <= grid.config.maxValue; value++) {
          // Skip if value is already placed in this unit
          if (unit.some((c) => c.value === value)) {
            continue;
          }

          // Find cells where this value is possible
          const possibleCells = unit.filter(
            (cell) => cell.value === null && cell.possibleValues.has(value)
          );

          if (possibleCells.length === 0) {
            // Value cannot be placed anywhere - contradiction
            return false;
          }

          if (possibleCells.length === 1) {
            const cell = possibleCells[0];
            grid.setValue(cell.coordinate, value);

            if (!this.eliminateFromPeers(cell.coordinate, value, grid)) {
              return false;
            }

            changed = true;
          }
        }
      }

      // Recalculate possible values if changes were made
      if (changed) {
        grid.calculatePossibleValues();
      }
    }

    return true;
  }

  /**
   * Eliminate a value from all peers of a coordinate.
   * Returns false if this causes a contradiction.
   */
  private eliminateFromPeers(
    coord: Coordinate,
    value: number,
    grid: Grid
  ): boolean {
    for (const peer of grid.getAllPeers(coord)) {
      if (peer.possibleValues.has(value)) {
        peer.possibleValues.delete(value);

        // Check for contradiction
        if (peer.possibleValues.size === 0 && peer.value === null) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Single step of constraint propagation (for visualization)
   */
  propagateStep(grid: Grid): { changed: boolean; contradiction: boolean } {
    // Try naked singles first
    for (const cell of grid.getEmptyCells()) {
      if (cell.possibleValues.size === 0) {
        return { changed: false, contradiction: true };
      }

      if (cell.possibleValues.size === 1) {
        const value = Array.from(cell.possibleValues)[0];
        grid.setValue(cell.coordinate, value);
        this.eliminateFromPeers(cell.coordinate, value, grid);
        grid.calculatePossibleValues();
        return { changed: true, contradiction: false };
      }
    }

    // Try hidden singles
    for (const unit of grid.getAllUnits()) {
      for (let value = 1; value <= grid.config.maxValue; value++) {
        if (unit.some((c) => c.value === value)) {
          continue;
        }

        const possibleCells = unit.filter(
          (cell) => cell.value === null && cell.possibleValues.has(value)
        );

        if (possibleCells.length === 0) {
          return { changed: false, contradiction: true };
        }

        if (possibleCells.length === 1) {
          const cell = possibleCells[0];
          grid.setValue(cell.coordinate, value);
          this.eliminateFromPeers(cell.coordinate, value, grid);
          grid.calculatePossibleValues();
          return { changed: true, contradiction: false };
        }
      }
    }

    return { changed: false, contradiction: false };
  }
}
