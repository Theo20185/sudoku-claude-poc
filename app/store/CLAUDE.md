# Store Module

Zustand stores for application state management.

## Stores

| Store | Purpose |
|-------|---------|
| `puzzleStore` | Grid state, solving, history |
| `uiStore` | Selection, input mode, modals |
| `themeStore` | Theme mode, colors, presets |

## puzzleStore

Main puzzle state and operations.

### State

```typescript
interface PuzzleStoreState {
  // Grid
  gridSize: GridSize;
  cells: Map<string, CellState>;
  status: PuzzleStatus;

  // History
  history: PuzzleSnapshot[];
  historyIndex: number;

  // Solver
  solutions: Solution[];
  currentSolutionIndex: number;
  isSearching: boolean;
  searchProgress: SearchProgress | null;

  // Errors
  error: string | null;
}
```

### Key Actions

```typescript
// Initialization
initializePuzzle(size: GridSize): void
loadFromString(input: string, size: GridSize): void
loadRandomPuzzle(size: GridSize, difficulty?: Difficulty): void
reset(): void   // Clear user entries, keep givens
clear(): void   // Empty entire grid

// Cell operations
setCell(coord, value): void
togglePencilMark(coord, value): void
clearCell(coord): void

// Solving
solve(): Promise<boolean>
findAllSolutions(options?): Promise<void>
autoFillConfident(): number

// History
undo(): void
redo(): void
```

## uiStore

UI-only state (not persisted with puzzle).

```typescript
interface UIStoreState {
  selectedCell: string | null;
  inputMode: "value" | "pencil";
  isTextInputOpen: boolean;
  isSettingsOpen: boolean;
  isHelpOpen: boolean;
}
```

## themeStore

Theme preferences (persisted to localStorage).

```typescript
interface ThemeStoreState {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  secondaryColor: string;
  customColors: SudokuColors;
  backgroundImage: string | null;
}
```

## Patterns

### Adding New Action

```typescript
// In store interface
interface PuzzleStoreActions {
  myNewAction: (param: Type) => void;
}

// In store implementation
myNewAction: (param) => {
  set((state) => {
    // Immer allows direct mutation
    state.someValue = param;
  });
},
```

### Accessing Grid Object

```typescript
// Inside store action
const grid = get().getGrid();  // Returns Grid instance
grid.someOperation();
set((state) => {
  state.cells = grid.getCellsMap();
});
```

### Middleware Stack

```typescript
create<Store>()(
  devtools(      // Redux DevTools support
    persist(     // localStorage persistence
      immer(     // Immutable updates via mutation syntax
        (set, get) => ({ ... })
      )
    )
  )
)
```
