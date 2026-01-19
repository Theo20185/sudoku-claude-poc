# End-to-End Test Specification

## Overview

This document specifies the end-to-end tests for the Sudoku application. The application is a client-side React Router app with no backend.

**Test Status**: All 156 tests passing

## Testing Framework

**Playwright** is used for E2E testing due to:
- Excellent support for modern React applications
- Built-in drag-and-drop support (critical for NumberPalette)
- Cross-browser testing capabilities
- Good keyboard event simulation
- localStorage mocking support

## Test Suites

---

## 1. Application Initialization

### 1.1 Initial Load
- [x] App loads without errors
- [x] Default 9x9 grid displays with 81 cells
- [x] Grid has correct box borders (3x3 sections)
- [x] Number palette shows numbers 1-9
- [x] All controls are in default state (no selection, value mode, hints off)

### 1.2 State Persistence on Reload
- [x] Enter values in several cells, reload page → values persist
- [x] Change theme to dark mode, reload → theme persists
- [x] Enable pencil mode, reload → pencil mode persists
- [x] Enable hints, reload → hints setting persists

---

## 2. Cell Selection & Navigation

### 2.1 Mouse Selection
- [x] Click empty cell → cell becomes selected (visual highlight)
- [x] Click different cell → previous deselects, new cell selects
- [x] Click same cell twice → cell remains selected
- [x] Click outside grid → cell deselects

### 2.2 Related Cell Highlighting
- [x] Select cell → all cells in same row highlight
- [x] Select cell → all cells in same column highlight
- [x] Select cell → all cells in same 3x3 box highlight

### 2.3 Keyboard Navigation
- [x] Arrow Up → selection moves up one row
- [x] Arrow Down → selection moves down one row
- [x] Arrow Left → selection moves left one column
- [x] Arrow Right → selection moves right one column
- [x] Arrow Up from row 0 → wraps to row 8
- [x] Arrow Down from row 8 → wraps to row 0
- [x] Arrow Left from col 0 → wraps to col 8
- [x] Arrow Right from col 8 → wraps to col 0

---

## 3. Value Entry

### 3.1 Keyboard Input
- [x] Select cell, press 1-9 → value appears in cell
- [x] Press Delete on filled cell → cell clears
- [x] Press Backspace on filled cell → cell clears
- [x] Press number on given cell → no change (given cells immutable)
- [x] Press invalid key (letter, symbol) → no change

### 3.2 Number Palette Click
- [x] Select cell, click number in palette → value enters cell
- [x] Click palette number with no cell selected → no change
- [x] Click palette number on given cell → no change

### 3.3 Drag and Drop
- [x] Drag number from palette over cell → visual drop indicator shows
- [x] Drop number on empty cell → value enters cell
- [x] Drop number on filled cell → no change
- [x] Drop number on given cell → no change
- [x] Release drag outside grid → no change

---

## 4. Pencil Marks (Notes)

### 4.1 Pencil Mode Toggle
- [x] Click pencil mode toggle → mode switches to pencil
- [x] Pencil mode indicator visible when active
- [x] Click again → mode returns to value

### 4.2 Pencil Mark Entry
- [x] In pencil mode, press number → pencil mark appears (small number)
- [x] Press same number again → pencil mark removes (toggle behavior)
- [x] Multiple pencil marks display in grid layout within cell
- [x] Pencil marks on given cell → no change

### 4.3 Pencil Mark Clearing
- [x] Switch to value mode, enter value → all pencil marks in cell clear
- [x] Clear cell → pencil marks remain (only value clears)

### 4.4 Drag and Drop in Pencil Mode
- [x] In pencil mode, drag number to cell → adds pencil mark
- [x] Drag same number to cell with that mark → removes pencil mark

---

## 5. Puzzle Import

### 5.1 Import Dialog
- [x] Click "Import Puzzle" → dialog opens
- [x] Dialog shows text input area
- [x] Character counter shows "0 / 81" initially
- [x] Cancel button closes dialog without changes

### 5.2 Valid Import
- [x] Paste 81-character puzzle string → counter shows "81 / 81"
- [x] Load button becomes enabled
- [x] Click Load → puzzle displays in grid, dialog closes
- [x] Given cells (non-zero values) marked as immutable

### 5.3 Import Validation
- [x] Enter < 81 characters → Load button disabled
- [x] Enter > 81 characters → error message shown
- [x] Supported empty formats: `.`, `0`, space → all treated as empty
- [x] Invalid characters → error message shown

### 5.4 Single-Line Import Formats
- [x] Single line: `530070000600195...` → loads correctly
- [x] With dots for empty: `5.3..7....` → loads correctly
- [x] With zeros for empty: `503007000` → loads correctly

### 5.5 Multi-Line Import Formats
- [x] 9 lines of 9 digits each (no separators):
  ```
  530070000
  600195000
  098000060
  800060003
  400803001
  700020006
  060000280
  000419005
  000080079
  ```
- [x] Grid with spaces between digits:
  ```
  5 3 0 0 7 0 0 0 0
  6 0 0 1 9 5 0 0 0
  ...
  ```
- [x] Grid with pipe separators for boxes:
  ```
  5 3 0 | 0 7 0 | 0 0 0
  6 0 0 | 1 9 5 | 0 0 0
  0 9 8 | 0 0 0 | 0 6 0
  ------+-------+------
  8 0 0 | 0 6 0 | 0 0 3
  ...
  ```
- [x] Grid with dashes as row separators → dashes ignored, puzzle loads
- [x] Mixed whitespace (tabs, spaces, newlines) → normalized and loads correctly
- [x] Trailing/leading whitespace on lines → trimmed and loads correctly
- [x] Windows line endings (CRLF) → handled correctly
- [x] Unix line endings (LF) → handled correctly

### 5.6 Multi-Line Validation
- [x] Multi-line with extra blank lines → blank lines ignored, puzzle loads

---

## 6. Random Puzzle Generation

### 6.1 Generation
- [x] Select difficulty (Easy/Medium/Hard/Expert)
- [x] Click Generate → new puzzle appears
- [x] Generated puzzle has given cells (immutable)
- [x] Previous puzzle is replaced

### 6.2 Difficulty Levels
- [x] Easy puzzle → more given cells visible
- [x] Expert puzzle → fewer given cells visible (17-30 clues)
- [x] Each generation produces different puzzle

### 6.3 Puzzle Validity
- [x] Generated puzzle is solvable
- [x] Generated puzzle has unique solution

---

## 7. Undo/Redo

### 7.1 Undo Functionality
- [x] Enter value → Undo → value removed
- [x] Undo button disabled when no history
- [x] Multiple undos work sequentially
- [x] Undo restores pencil marks

### 7.2 Redo Functionality
- [x] Undo → Redo → value restored
- [x] Redo button disabled when at latest state
- [x] Multiple redos work sequentially

### 7.3 History Branching
- [x] Undo, then enter new value → redo history clears
- [x] Redo button disabled after new action

---

## 8. Solver Features

### 8.1 Solve Button
- [x] Click Solve on valid puzzle → solution fills grid
- [x] Success message "Puzzle solved!" displays
- [x] Solve button disabled after solving
- [x] Click Solve on invalid puzzle → "No solution" message

### 8.2 Find All Solutions
- [x] Click Find All → progress indicator shows or completes
- [x] After completion → "Puzzle solved!" or "Solution X of Y" displays
- [x] Previous/Next buttons navigate solutions
- [x] Solutions display correctly in grid

### 8.3 Search Cancellation
- [x] During Find All, click Cancel → search stops

### 8.4 Auto-Fill Confident
- [x] Click Auto-Fill → cells with single possibility fill
- [x] Success message shows count of filled cells
- [x] If no confident cells → appropriate message displays

---

## 9. Reset and Clear

### 9.1 Reset Button
- [x] Click Reset → user entries clear
- [x] Given cells remain
- [x] Undo/redo history clears after reset

### 9.2 Clear All Button
- [x] Click Clear All → entire grid empties
- [x] No given cells remain

---

## 10. Hints System

### 10.1 Hints Toggle
- [x] Click hints toggle → hints panel activates
- [x] Toggle off → hints content hides (panel remains, mode toggle hides)

### 10.2 Selected Cell Hints Mode
- [x] Enable hints, select "Selected" mode
- [x] Select empty cell → possible values display
- [x] Cell with one possibility → highlighted as confident
- [x] Select filled cell → "Cell already filled" message
- [x] No selection → "Select an empty cell" message

### 10.3 All Cells Hints Mode
- [x] Select "All" mode → cells with hints display
- [x] Cells sorted by fewest possibilities first
- [x] Confident cells (1 possibility) highlighted
- [x] More than 10 cells → "+X more" indicator

### 10.4 Hints Update
- [x] Enter value → hints recalculate for affected cells
- [x] Clear cell → hints recalculate

---

## 11. Conflict Detection

### 11.1 Row Conflicts
- [x] Enter duplicate value in same row → both cells show conflict styling
- [x] Clear one duplicate → conflict styling removes

### 11.2 Column Conflicts
- [x] Enter duplicate value in same column → conflict shown
- [x] Clear duplicate → conflict clears

### 11.3 Box Conflicts
- [x] Enter duplicate value in same 3x3 box → conflict shown
- [x] Clear duplicate → conflict clears

### 11.4 Multiple Conflicts
- [x] Value conflicting in multiple ways → all conflicts shown
- [x] Clearing one conflict may leave others

---

## 12. Theme Switching

### 12.1 Theme Toggle
- [x] Click theme toggle → cycles through system/light/dark modes
- [x] Light mode → light background, dark text
- [x] Dark mode → dark background, light text
- [x] System mode → matches OS preference

### 12.2 Theme Persistence
- [x] Change theme, reload page → theme persists

### 12.3 Visual Consistency
- [x] All grid elements visible in light mode
- [x] All grid elements visible in dark mode
- [x] Conflict highlighting visible in both modes
- [x] Selection highlighting visible in both modes

---

## 13. Accessibility

### 13.1 Keyboard-Only Operation
- [x] Tab through all interactive elements
- [x] Complete puzzle using only keyboard (no mouse)
- [x] All buttons accessible via keyboard

### 13.2 Screen Reader Support
- [x] Cells have appropriate aria-labels
- [x] Grid has role="grid"
- [x] Cell values announced correctly

### 13.3 Focus Management
- [x] Focus indicators visible on all interactive elements
- [x] Focus moves logically through interface

---

## 14. Complete User Flows

### 14.1 Solve Imported Puzzle
- [x] Complete flow: import, verify, solve

### 14.2 Manual Solve with Hints
- [x] Complete flow: generate, use hints, enter values

### 14.3 Explore Multiple Solutions
- [x] Complete flow: import multi-solution puzzle, find all, navigate

### 14.4 Undo/Redo Workflow
- [x] Complete flow: enter values, undo, redo, branch history

### 14.5 Theme Persistence Workflow
- [x] Complete flow: switch theme, enter values, reload, verify both persist

---

## 15. Error Scenarios

### 15.1 Invalid Puzzle Import
- [x] Import string with invalid characters → error message
- [x] Import puzzle with conflicts → loads but shows conflicts
- [x] Import empty string → Load button disabled

### 15.2 Unsolvable Puzzle
- [x] Create puzzle with conflicts, click Solve → "No solution" message
- [x] User can continue editing after unsolvable

### 15.3 Search Limits
- [x] Puzzle with many solutions → search stops at limit
- [x] Search limit reached warning displays
- [x] Partial results available

---

## Test Data

### Sample Puzzles

**Easy (many givens):**
```
530070000600195000098000060800060003400803001700020006060000280000419005000080079
```

**Hard (few givens):**
```
000000000000003085001020000000507000004000100090000000500000073002010000000040009
```

**Multiple Solutions:**
```
000000000000000000000000000000000000000000000000000000000000000000000000000000000
```
(Empty grid - many solutions)

**Invalid (no solution):**
```
110000000000000000000000000000000000000000000000000000000000000000000000000000000
```
(Two 1s in first row)

---

## Implementation Notes

### LocalStorage Keys
- `sudoku-puzzle` - Puzzle state
- `sudoku-ui` - UI preferences
- `sudoku-theme` - Theme settings

### Test Setup
```typescript
// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
```

### Drag and Drop Testing
Playwright provides built-in drag and drop support:
```typescript
await page.locator('[data-number="5"]').dragTo(
  page.locator('[data-cell="r0c0"]')
);
```

### Waiting for Async Operations
```typescript
// Wait for solve operation
await expect(page.getByText('Puzzle solved!')).toBeVisible();

// Wait for search completion
await expect(page.getByText(/Solution \d+ of \d+/)).toBeVisible();
```

### Test Timeouts
Some solver operations can take up to 30 seconds (especially for invalid puzzles). Tests in sections 8.1 and 15.2 use extended timeouts:
```typescript
test.describe.configure({ timeout: 60000 });
```
