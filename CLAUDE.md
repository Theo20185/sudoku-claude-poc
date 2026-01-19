# Sudoku Application

## Overview

A feature-rich Sudoku application with puzzle solving, generation, and an interactive UI.

## Tech Stack

- **Framework:** React 19 with React Router 7 (server-rendered)
- **Language:** TypeScript 5.9 (strict mode)
- **Build:** Vite 7
- **State:** Zustand 5 with Immer middleware
- **UI:** Material-UI (MUI) 6
- **Styling:** SCSS modules + MUI theming
- **Interactions:** react-dnd (drag-and-drop)
- **Testing:** Playwright (E2E)

## Project Structure

```
app/
├── core/           # Business logic (no React dependencies)
│   ├── models/     # Data types, Grid class
│   ├── solver/     # Solving algorithms
│   ├── generator/  # Puzzle generation
│   ├── validator/  # Input validation
│   └── utils/      # Helper functions
├── store/          # Zustand stores
├── components/     # React UI components
├── styles/         # Global styles, theme, mixins
└── routes/         # Page routes
e2e/                # Playwright E2E tests
```

## Key Conventions

### Grid Representation

- **Cell ID format:** `r{row}c{col}` (e.g., `r0c5` for row 0, column 5)
- **Grid size:** 9×9 (81 cells)
- **Values:** 1-9 (null for empty)
- **Puzzle string format:** 81 chars using digits 1-9 and `.` or `0` for empty
- **Import formats:** Single-line, multi-line, with optional formatting chars (`|`, `-`, `+`, `:`) stripped

### State Management

- All puzzle state lives in `puzzleStore`
- UI state (selection, modals) lives in `uiStore`
- Theme state lives in `themeStore`
- Use Immer for immutable updates (via Zustand middleware)

### Styling

- Use SCSS modules for component styles
- Use CSS variables for theme-aware colors (set in ThemeProvider)
- Dark mode: all colors must work in both light and dark modes
- Key CSS variables: `--sudoku-*` for Sudoku-specific, `--mui-palette-*` for MUI

### TypeScript

- Strict mode enabled
- Use `type` imports for type-only imports
- Enums: `Difficulty`, `PuzzleStatus` are enums (use `Difficulty.MEDIUM`, not `"medium"`)
- Prefer interfaces for object shapes, types for unions

### Testing

- E2E tests use Playwright in `e2e/` folder
- Test files: `*.spec.ts`
- Run tests: `npx playwright test`
- Test spec documentation: `e2e/TEST-SPEC.md`

## Common Tasks

### Adding a new feature to the puzzle

1. Add types to `app/core/models/types.ts`
2. Implement logic in appropriate `app/core/` module
3. Add store action in `app/store/puzzleStore.ts`
4. Add UI in `app/components/`

### Adding a new theme color

1. Add to `CustomThemeOptions` in `app/styles/theme/muiTheme.ts`
2. Set CSS variable in `app/components/common/ThemeProvider/ThemeProvider.tsx`
3. Use variable in SCSS with fallback: `var(--sudoku-new-color, #default)`
