# Components

React UI components organized by feature.

## Structure

```
components/
├── common/         # Shared utilities (ThemeProvider)
├── layout/         # App structure (Header, AppLayout)
├── grid/           # Sudoku grid (SudokuGrid, Cell, NumberPalette)
├── controls/       # User controls (InputControls, SolverControls)
└── hints/          # Hints panel
```

## Component Patterns

### State Access

```typescript
// Use selector functions for performance
const gridSize = usePuzzleStore((state) => state.gridSize);
const setCell = usePuzzleStore((state) => state.setCell);

// NOT: const { gridSize, setCell } = usePuzzleStore();
```

### Styling

- One `.module.scss` file per component
- Use CSS variables for theme-aware colors
- Import mixins: `@use "../../../styles/mixins" as *;`

```scss
.myComponent {
  color: var(--sudoku-user-text, #1976d2);
  background: var(--mui-palette-action-hover, #f5f5f5);
}
```

### Props Interface

```typescript
interface MyComponentProps {
  required: string;
  optional?: number;
}

export function MyComponent({ required, optional = 10 }: MyComponentProps) {
  // ...
}
```

## Key Components

### Cell (`grid/Cell`)
- Displays single Sudoku cell
- Handles selection, drag-drop, keyboard input
- States: selected, related, highlighted, conflict, given

### SudokuGrid (`grid/SudokuGrid`)
- Renders full grid with box borders
- Manages cell selection and navigation
- Keyboard event handling (arrows, numbers, delete)
- Click-outside-to-deselect (deselects cell when clicking outside grid, except on interactive elements)

### NumberPalette (`grid/NumberPalette`)
- Draggable number buttons
- Shows remaining count per number

### InputControls (`controls/InputControls`)
- Mode toggle (value/pencil)
- Import puzzle button
- Random puzzle button
- Undo/redo

### SolverControls (`controls/SolverControls`)
- Solve, Find All, Auto-fill buttons
- Solution navigation
- Reset/Clear

## Adding New Controls

1. Create component in appropriate directory
2. Add SCSS module for styles
3. Connect to store with selectors
4. Add to parent layout component
