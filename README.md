# Sudoku - A Claude AI Collaboration Project

A feature-rich Sudoku application built as a proof-of-concept to explore what Claude (Anthropic's AI assistant) could accomplish given a greenfield project and only a specification to start.

![Tests](https://img.shields.io/badge/tests-156%20passing-brightgreen)
![Playwright](https://img.shields.io/badge/e2e-Playwright-45ba63)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19-61dafb)

**[Live Demo](https://theo20185.github.io/sudoku-claude-poc/)**

## About This Project

This project was developed collaboratively between a human developer and Claude AI using [Claude Code](https://claude.ai/claude-code), Anthropic's CLI tool for AI-assisted software development. The goal was to see how effectively Claude could:

- Architect a complete application from scratch
- Implement complex algorithms (puzzle generation, constraint propagation, backtracking solvers)
- Build a polished, interactive UI with proper state management
- Write comprehensive end-to-end tests
- Handle iterative refinement based on feedback
- Debug and fix issues as they arose

The human provided high-level requirements and feedback, while Claude wrote the code, designed the architecture, and implemented the features.

## Features

- **Interactive Sudoku Grid** - Click, type, or drag-and-drop to enter values
- **Pencil Marks** - Toggle between value and pencil mark modes for note-taking
- **Random Puzzle Generation** - Generate puzzles with selectable difficulty (Easy, Medium, Hard, Expert)
- **Puzzle Import** - Paste puzzles in various formats:
  - Single-line: `530070000600195000...`
  - Multi-line grid with optional formatting (`|`, `-`, `+` separators supported)
- **Smart Hints** - Shows possible values using constraint propagation (naked singles, hidden singles)
- **Auto-Solver** - Solves puzzles using backtracking with MRV heuristic
- **Find All Solutions** - Discovers all valid solutions for a puzzle
- **Auto-Fill** - Fills cells that have only one possible value
- **Conflict Detection** - Highlights invalid placements in real-time
- **Undo/Redo** - Full history support for all cell operations
- **Click-Outside Deselect** - Click outside the grid to deselect the current cell
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on desktop and tablet screens
- **Keyboard Navigation** - Full keyboard support with arrow keys and number input

## Tech Stack

- **Framework:** React 19 with React Router 7 (server-rendered)
- **Language:** TypeScript 5.9 (strict mode)
- **Build:** Vite 7
- **State Management:** Zustand 5 with Immer middleware
- **UI Components:** Material-UI (MUI) 6
- **Styling:** SCSS modules + MUI theming
- **Drag & Drop:** react-dnd
- **Testing:** Playwright (E2E)

## Project Structure

```
app/
├── core/           # Pure business logic (no React dependencies)
│   ├── models/     # Data types, Grid class
│   ├── solver/     # Solving algorithms (constraint propagation, backtracking)
│   ├── generator/  # Puzzle generation
│   ├── validator/  # Input validation and sanitization
│   └── utils/      # Helper functions
├── store/          # Zustand stores (puzzle, UI, theme state)
├── components/     # React UI components
├── styles/         # Global styles, theme, SCSS mixins
└── routes/         # Page routes
e2e/                # Playwright E2E tests (156 tests)
```

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

## Testing

The project includes a comprehensive E2E test suite using Playwright with 156 tests covering all features.

### Run Tests

```bash
# Run all tests
npx playwright test

# Run with visible browser
npx playwright test --headed

# Run specific test file
npx playwright test e2e/08-solver.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui
```

### Test Coverage

| Test Suite | Tests | Description |
|------------|-------|-------------|
| Initialization | 9 | App load, state persistence |
| Cell Selection | 15 | Mouse/keyboard selection, highlighting |
| Value Entry | 14 | Keyboard, palette, drag-drop input |
| Pencil Marks | 12 | Pencil mode, notes entry |
| Puzzle Import | 24 | Import dialog, format validation |
| Random Puzzle | 8 | Generation, difficulty levels |
| Undo/Redo | 11 | History management |
| Solver | 12 | Solve, Find All, Auto-fill |
| Reset/Clear | 5 | Reset and Clear buttons |
| Hints | 12 | Hints panel, modes |
| Conflicts | 8 | Conflict detection |
| Theme | 12 | Theme switching, persistence |
| Accessibility | 8 | Keyboard nav, ARIA |
| User Flows | 5 | Complete workflows |
| Error Scenarios | 9 | Error handling |

## How to Play

1. **Enter Values:** Select a cell and press 1-9, or drag a number from the palette
2. **Pencil Marks:** Toggle to pencil mode to add candidate notes
3. **Navigation:** Use arrow keys to move between cells
4. **Clear:** Press Delete or Backspace to clear a cell
5. **Deselect:** Click outside the grid to deselect the current cell
6. **Generate Puzzle:** Select a difficulty and click "Generate" for a new puzzle
7. **Import Puzzle:** Click "Import Puzzle" to paste a puzzle string
8. **Get Help:** Enable hints to see possible values for cells

## Algorithms

### Puzzle Generation
1. Creates a complete valid solution using randomized backtracking
2. Removes cells while ensuring a unique solution remains
3. Difficulty controls target clue count (Expert: 17-30, Easy: 36-45)

### Solver
1. **Constraint Propagation:** Applies naked singles and hidden singles
2. **Backtracking:** Uses MRV (Minimum Remaining Values) heuristic for cell selection
3. **Solution Search:** Can find all solutions up to a configurable limit

### Hint System
Uses full constraint propagation to show accurate candidate values. If a cell has only one possibility, it's marked as "confident" and can be auto-filled.

## License

MIT

---

Built with Claude AI using [Claude Code](https://claude.ai/claude-code)
