# Sudoku - A Claude AI Collaboration Project

A feature-rich Sudoku application built as a proof-of-concept to explore what Claude (Anthropic's AI assistant) could accomplish given a greenfield project and only a specification to start.

## About This Project

This project was developed collaboratively between a human developer and Claude AI using [Claude Code](https://claude.ai/claude-code), Anthropic's CLI tool for AI-assisted software development. The goal was to see how effectively Claude could:

- Architect a complete application from scratch
- Implement complex algorithms (puzzle generation, constraint propagation, backtracking solvers)
- Build a polished, interactive UI with proper state management
- Handle iterative refinement based on feedback
- Debug and fix issues as they arose

The human provided high-level requirements and feedback, while Claude wrote the code, designed the architecture, and implemented the features.

## Features

- **Interactive Sudoku Grid** - Click, type, or drag-and-drop to enter values
- **Pencil Marks** - Toggle between value and pencil mark modes for note-taking
- **Random Puzzle Generation** - Generate puzzles with selectable difficulty (Easy, Medium, Difficult, Master)
- **Puzzle Import** - Paste puzzles in single-line or multi-line grid format
- **Smart Hints** - Shows possible values using constraint propagation (naked singles, hidden singles)
- **Auto-Solver** - Solves puzzles using backtracking with MRV heuristic
- **Find All Solutions** - Discovers all valid solutions for a puzzle
- **Conflict Detection** - Highlights invalid placements in real-time
- **Undo/Redo** - Full history support with keyboard shortcuts
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on desktop and tablet screens

## Tech Stack

- **Framework:** React 19 with React Router 7 (server-rendered)
- **Language:** TypeScript 5.9 (strict mode)
- **Build:** Vite 7
- **State Management:** Zustand 5 with Immer middleware
- **UI Components:** Material-UI (MUI) 6
- **Styling:** SCSS modules + MUI theming
- **Drag & Drop:** react-dnd
- **Testing:** Vitest

## Project Structure

```
app/
├── core/           # Pure business logic (no React dependencies)
│   ├── models/     # Data types, Grid class
│   ├── solver/     # Solving algorithms (constraint propagation, backtracking)
│   ├── generator/  # Puzzle generation
│   ├── validator/  # Input validation
│   └── utils/      # Helper functions
├── store/          # Zustand stores (puzzle, UI, theme state)
├── components/     # React UI components
├── styles/         # Global styles, theme, SCSS mixins
└── routes/         # Page routes
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

## How to Play

1. **Enter Values:** Select a cell and press 1-9, or drag a number from the palette
2. **Pencil Marks:** Toggle to pencil mode to add candidate notes
3. **Navigation:** Use arrow keys to move between cells
4. **Clear:** Press Delete or Backspace to clear a cell
5. **Generate Puzzle:** Select a difficulty and click "Generate" for a new puzzle
6. **Import Puzzle:** Click "Import Puzzle" to paste a puzzle string

## Algorithms

### Puzzle Generation
1. Creates a complete valid solution using randomized backtracking
2. Removes cells while ensuring a unique solution remains
3. Difficulty controls how many cells are removed

### Solver
1. **Constraint Propagation:** Applies naked singles and hidden singles
2. **Backtracking:** Uses MRV (Minimum Remaining Values) heuristic for cell selection
3. **LCV Ordering:** Tries values that eliminate fewest possibilities first

## License

MIT

---

Built with Claude AI using [Claude Code](https://claude.ai/claude-code)
