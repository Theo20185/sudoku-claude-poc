# E2E Tests

Playwright end-to-end tests for the Sudoku application.

## Structure

```
e2e/
├── fixtures.ts       # Test fixtures, page objects, sample puzzles
├── *.spec.ts         # Test files organized by feature
└── TEST-SPEC.md      # Full test specification document
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/08-solver.spec.ts

# Run with visible browser
npx playwright test --headed

# Run with UI mode
npx playwright test --ui
```

## Test Files

| File | Description |
|------|-------------|
| `01-initialization.spec.ts` | App load, state persistence |
| `02-cell-selection.spec.ts` | Mouse/keyboard selection, highlighting |
| `03-value-entry.spec.ts` | Keyboard, palette, drag-drop input |
| `04-pencil-marks.spec.ts` | Pencil mode, notes entry |
| `05-puzzle-import.spec.ts` | Import dialog, format validation |
| `06-random-puzzle.spec.ts` | Puzzle generation, difficulty |
| `07-undo-redo.spec.ts` | History management |
| `08-solver.spec.ts` | Solve, Find All, Auto-fill |
| `09-reset-clear.spec.ts` | Reset and Clear buttons |
| `10-hints.spec.ts` | Hints panel, modes |
| `11-conflicts.spec.ts` | Conflict detection |
| `12-theme.spec.ts` | Theme switching, persistence |
| `13-accessibility.spec.ts` | Keyboard nav, ARIA |
| `14-user-flows.spec.ts` | Complete workflows |
| `15-error-scenarios.spec.ts` | Error handling |

## Fixtures (`fixtures.ts`)

### SudokuPage Object

Helper class for common operations:

```typescript
const { sudokuPage } = await test.extend<{ sudokuPage: SudokuPage }>();

await sudokuPage.clickCell(0, 0);
await sudokuPage.typeNumber(5);
await sudokuPage.importPuzzle(PUZZLES.easy);
await sudokuPage.clickSolve();
```

### Sample Puzzles

```typescript
import { PUZZLES } from "./fixtures";

PUZZLES.easy      // Standard easy puzzle
PUZZLES.hard      // Minimal clues puzzle
PUZZLES.empty     // Empty grid (many solutions)
PUZZLES.invalid   // Two 1s in first row (no solution)
```

## Timeouts

Some solver operations can take up to 30 seconds. Tests in solver and error scenarios use extended timeouts:

```typescript
test.describe("8.1 Solve Button", () => {
  test.describe.configure({ timeout: 60000 });
  // ...
});
```

## Adding New Tests

1. Create or update `*.spec.ts` file in appropriate section
2. Use `SudokuPage` fixture for common operations
3. Update `TEST-SPEC.md` with new test cases
4. Run `npx playwright test` to verify
