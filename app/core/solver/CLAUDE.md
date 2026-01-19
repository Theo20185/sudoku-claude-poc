# Solver Module

Sudoku solving algorithms with support for finding single or all solutions.

## Architecture

```
Solver (facade)
├── ConstraintPropagation  # Logical deduction
├── Backtracker            # Search with heuristics
└── AllSolutionsFinder     # Exhaustive search
```

## Algorithms

### Constraint Propagation

Applies logical rules until no more deductions:

1. **Naked Singles** - Cell has only one possible value → assign it
2. **Hidden Singles** - Value can only go in one cell in a unit → assign it

Returns `false` if contradiction found (no solution possible).

**Note:** The same constraint propagation logic is also used in `Grid.calculatePossibleValues()` for displaying accurate hints to the user. This ensures that if a cell is logically forced to a value, that value is eliminated from the cell's peers' possibilities even before the value is placed.

### Backtracking

When constraint propagation stalls:

1. **MRV Heuristic** - Pick cell with fewest candidates (fail fast)
2. **LCV Ordering** - Try values that eliminate fewest possibilities first
3. Recurse with constraint propagation after each guess

### All Solutions Finder

Finds all solutions with safety limits:
- Max solutions (default: 1000)
- Max nodes explored (default: 10M)
- Max time (default: 30s)
- Abort signal support

## API

```typescript
class Solver {
  // Find one solution
  solve(grid: Grid): Solution | null

  // Check solution properties
  isSolvable(grid: Grid): boolean
  hasUniqueSolution(grid: Grid): boolean

  // Find multiple solutions
  findAllSolutions(grid, options?): SolverResult
  findAllSolutionsAsync(grid, options?): Promise<SolverResult>

  // Helpers
  getConfidentMoves(grid): Map<string, number>  // Cells with 1 possibility
  solveStep(grid): { cellId, value } | null     // Next logical move
  getHint(grid, cellId): { possibleValues, confident }
}
```

## Solution Format

```typescript
interface Solution {
  values: Map<string, number>;  // cellId -> value for all cells
}

interface SolverResult {
  solutions: Solution[];
  totalFound: number;
  searchLimitReached: boolean;
  timeElapsed: number;
  nodesExplored: number;
}
```

## Performance Notes

- 9×9 puzzles: typically < 10ms
- 16×16 puzzles: may take several seconds
- Use async version for UI responsiveness on large grids
