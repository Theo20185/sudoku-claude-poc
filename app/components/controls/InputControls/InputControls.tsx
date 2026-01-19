/**
 * Input Controls Component
 *
 * Controls for switching between input modes and methods.
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Box,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Edit as ValueIcon,
  EditNote as PencilIcon,
  TextFields as TextInputIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Casino as RandomIcon,
} from "@mui/icons-material";
import { usePuzzleStore } from "../../../store/puzzleStore";
import { useUIStore } from "../../../store/uiStore";
import { Difficulty } from "../../../core/models/types";
import type { InputMode } from "../../../core/models/types";
import styles from "./InputControls.module.scss";

// Display labels for difficulty levels
const difficultyLabels: Record<Difficulty, string> = {
  [Difficulty.EASY]: "Easy",
  [Difficulty.MEDIUM]: "Medium",
  [Difficulty.HARD]: "Difficult",
  [Difficulty.EXPERT]: "Master",
};

export function InputControls() {
  const inputMode = useUIStore((state) => state.inputMode);
  const setInputMode = useUIStore((state) => state.setInputMode);
  const openTextInput = useUIStore((state) => state.openTextInput);

  const undo = usePuzzleStore((state) => state.undo);
  const redo = usePuzzleStore((state) => state.redo);
  const historyIndex = usePuzzleStore((state) => state.historyIndex);
  const historyLength = usePuzzleStore((state) => state.history.length);
  const gridSize = usePuzzleStore((state) => state.gridSize);
  const loadRandomPuzzle = usePuzzleStore((state) => state.loadRandomPuzzle);

  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: InputMode | null
  ) => {
    if (newMode !== null) {
      setInputMode(newMode);
    }
  };

  const handleDifficultyChange = (event: SelectChangeEvent<Difficulty>) => {
    setDifficulty(event.target.value as Difficulty);
  };

  const handleRandomPuzzle = () => {
    loadRandomPuzzle(gridSize, difficulty);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  return (
    <Card className={styles.panel}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Input
        </Typography>

        {/* Input mode toggle */}
        <Box className={styles.section}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Mode
          </Typography>
          <ToggleButtonGroup
            value={inputMode}
            exclusive
            onChange={handleModeChange}
            size="small"
            fullWidth
          >
            <Tooltip title="Enter values (keyboard numbers or click)">
              <ToggleButton value="value" data-testid="value-mode-toggle">
                <ValueIcon fontSize="small" />
                <span className={styles.buttonLabel}>Value</span>
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Enter pencil marks (notes)">
              <ToggleButton value="pencil" data-testid="pencil-mode-toggle" aria-pressed={inputMode === "pencil"}>
                <PencilIcon fontSize="small" />
                <span className={styles.buttonLabel}>Pencil</span>
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Box>

        {/* Text input button */}
        <Box className={styles.section}>
          <Button
            variant="outlined"
            startIcon={<TextInputIcon />}
            onClick={openTextInput}
            fullWidth
            data-testid="import-puzzle-btn"
          >
            Import Puzzle
          </Button>
        </Box>

        {/* Random puzzle with difficulty selector */}
        <Box className={styles.section}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Random Puzzle
          </Typography>
          <Box className={styles.randomPuzzleRow}>
            <FormControl size="small" className={styles.difficultySelect}>
              <Select
                value={difficulty}
                onChange={handleDifficultyChange}
                data-testid="difficulty-select"
              >
                {Object.values(Difficulty).map((diff) => (
                  <MenuItem key={diff} value={diff} data-value={diff}>
                    {difficultyLabels[diff]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Generate a random puzzle with unique solution">
              <Button
                variant="contained"
                startIcon={<RandomIcon />}
                onClick={handleRandomPuzzle}
                data-testid="generate-btn"
              >
                Generate
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Undo/Redo */}
        <Box className={styles.section}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            History
          </Typography>
          <Box className={styles.historyButtons}>
            <Tooltip title="Undo (Ctrl+Z)">
              <span>
                <Button
                  variant="outlined"
                  onClick={undo}
                  disabled={!canUndo}
                  size="small"
                  data-testid="undo-btn"
                >
                  <UndoIcon fontSize="small" />
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <span>
                <Button
                  variant="outlined"
                  onClick={redo}
                  disabled={!canRedo}
                  size="small"
                  data-testid="redo-btn"
                >
                  <RedoIcon fontSize="small" />
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Instructions */}
        <Box className={styles.instructions}>
          <Typography variant="caption" color="text.secondary" component="div">
            <strong>To enter a number:</strong>
          </Typography>
          <ul className={styles.instructionList}>
            <li>
              <Typography variant="caption" color="text.secondary">
                Select a cell, then press 1-9 or click the palette
              </Typography>
            </li>
            <li>
              <Typography variant="caption" color="text.secondary">
                Drag a number from the palette onto a cell
              </Typography>
            </li>
          </ul>
          <Typography variant="caption" color="text.secondary" component="div">
            <strong>Other controls:</strong>
          </Typography>
          <ul className={styles.instructionList}>
            <li>
              <Typography variant="caption" color="text.secondary">
                Arrow keys to navigate between cells
              </Typography>
            </li>
            <li>
              <Typography variant="caption" color="text.secondary">
                Delete/Backspace to clear a cell
              </Typography>
            </li>
          </ul>
        </Box>
      </CardContent>
    </Card>
  );
}
