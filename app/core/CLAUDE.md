# Core Module

Pure business logic with no React dependencies. Can be tested independently.

## Modules

| Module | Purpose |
|--------|---------|
| `models/` | Data types and Grid class |
| `solver/` | Sudoku solving algorithms |
| `generator/` | Random puzzle generation |
| `validator/` | Input sanitization and validation |
| `utils/` | Grid helper functions |

## Key Types (`models/types.ts`)

```typescript
type GridSize = 4 | 9 | 16 | 25;
type CellValue = number | null;

interface CellState {
  id: string;                    // "r{row}c{col}"
  coordinate: { row, col };
  value: CellValue;
  isGiven: boolean;              // Part of original puzzle
  isValid: boolean;              // No conflicts
  possibleValues: Set<number>;   // Candidate values
  pencilMarks: Set<number>;      // User notes
  groupIndex: number;            // Box index
}

enum Difficulty { EASY, MEDIUM, HARD, EXPERT }
enum PuzzleStatus { EDITING, SOLVING, SOLVED, INVALID, NO_SOLUTION }
```

## Grid Class (`models/Grid.ts`)

Central data structure. Key methods:

```typescript
// Cell operations
getCell(coord): CellState
setValue(coord, value): void
setGiven(coord, value): void
clearCell(coord): void

// Queries
getEmptyCells(): CellState[]
getFilledCells(): CellState[]
getAllPeers(coord): CellState[]  // Same row, col, or box
getAllUnits(): CellState[][]     // All rows, columns, and boxes
isValidPlacement(coord, value): boolean
getConflicts(coord): Coordinate[]

// State
isSolved(): boolean
hasConflicts(): boolean
calculatePossibleValues(): void  // Updates all cells' possibleValues with constraint propagation
validateAll(): void              // Marks cells as valid/invalid

// Serialization
toString(): string               // "53..7...." format
fromString(str, asGiven): void
clone(): Grid
```

### calculatePossibleValues() - Constraint Propagation

This method computes candidate values for all empty cells using full constraint propagation:

1. **Basic elimination**: Remove values already placed in the same row, column, or box
2. **Naked singles**: If a cell has only one possible value, eliminate that value from all its peers
3. **Hidden singles**: If a value can only go in one cell within a unit (row/column/box), reduce that cell to only that value

The algorithm loops until no more eliminations can be made. This ensures hints accurately reflect logically forced values - if cell A must be 3, then 3 won't appear as a possibility in any of A's peers, even before the user places the value.

## Design Principles

1. **Immutability at boundaries** - Grid is mutable internally, but store creates new instances
2. **No side effects** - Functions don't modify inputs, return new values
3. **Validation at edges** - Validate input at API boundaries, trust internal data
