# Puzzle Generator

Generates random Sudoku puzzles with guaranteed unique solutions.

## Algorithm

### Phase 1: Generate Complete Solution

Uses randomized backtracking:
1. Find first empty cell
2. Get possible values, shuffle randomly
3. Try each value, recurse
4. Backtrack if no valid placement

### Phase 2: Remove Cells

Creates puzzle from complete solution:
1. Get all cells in random order
2. For each cell, try removing it
3. Check if puzzle still has unique solution (using Solver)
4. If not unique, restore the cell
5. Stop when target clue count reached

## Difficulty Configuration

Target clue counts for 9×9:

| Difficulty | Clues |
|------------|-------|
| Easy | 36-45 |
| Medium | 28-35 |
| Hard | 22-27 |
| Expert | 17-21 |

Note: 17 is the theoretical minimum for a unique 9×9 puzzle.

## API

```typescript
class PuzzleGenerator {
  generate(size: GridSize, difficulty: Difficulty = Difficulty.MEDIUM): string
}

// Singleton instance
export const puzzleGenerator: PuzzleGenerator
```

## Usage

```typescript
import { puzzleGenerator } from "../core/generator";
import { Difficulty } from "../core/models/types";

const puzzle = puzzleGenerator.generate(9, Difficulty.HARD);
// Returns: "5...8..1...." (81 char string)
```

## Constraints

- Generated puzzles MUST have exactly one solution
- Generation may be slow for larger grids (16×16, 25×25)
- Expert puzzles may take longer to generate (more removal attempts)
