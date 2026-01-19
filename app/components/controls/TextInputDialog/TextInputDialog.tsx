/**
 * Text Input Dialog Component
 *
 * Modal dialog for entering a puzzle via text input.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { usePuzzleStore } from "../../../store/puzzleStore";
import { useUIStore } from "../../../store/uiStore";
import { InputValidator } from "../../../core/validator/InputValidator";
import styles from "./TextInputDialog.module.scss";

export function TextInputDialog() {
  const gridSize = usePuzzleStore((state) => state.gridSize);
  const loadFromString = usePuzzleStore((state) => state.loadFromString);
  const isOpen = useUIStore((state) => state.isTextInputOpen);
  const closeDialog = useUIStore((state) => state.closeTextInput);

  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expectedLength = gridSize * gridSize;

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setInputText("");
      setError(null);
    }
  }, [isOpen]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInputText(value);
    setError(null);

    // Validate as user types
    const cleaned = value.replace(/\s+/g, "");
    if (cleaned.length > 0 && cleaned.length !== expectedLength) {
      // Don't show error while typing unless clearly wrong
      if (cleaned.length > expectedLength) {
        setError(`Too many characters. Expected ${expectedLength}, got ${cleaned.length}`);
      }
    }
  };

  const handleSubmit = () => {
    const validation = InputValidator.parseTextInput(inputText, gridSize);

    if (!validation.valid) {
      setError(validation.error || "Invalid input");
      return;
    }

    loadFromString(inputText, gridSize);
    closeDialog();
  };

  const handleClose = () => {
    setInputText("");
    setError(null);
    closeDialog();
  };

  // Example puzzle for the current grid size (multi-line format)
  const getExampleText = () => {
    if (gridSize === 4) {
      return "..1.\n.2..\n..3.\n.4..";
    }
    if (gridSize === 9) {
      return "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79";
    }
    if (gridSize === 16) {
      // 16x16 example with dots
      const row = ".".repeat(16);
      return Array(16).fill(row).join("\n");
    }
    // 25x25
    const row = ".".repeat(25);
    return Array(25).fill(row).join("\n");
  };

  const cleanedLength = inputText.replace(/\s+/g, "").length;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enter Puzzle</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Paste a puzzle as a single line or as a {gridSize}-line grid ({expectedLength} cells total).
          Use digits 1-{Math.min(gridSize, 9)}
          {gridSize > 9 ? ` and letters A-${String.fromCharCode(55 + gridSize)}` : ""} for values,
          and "." or "0" for empty cells. Whitespace and line breaks are ignored.
        </Typography>

        <TextField
          autoFocus
          multiline
          rows={gridSize <= 9 ? 4 : 6}
          fullWidth
          variant="outlined"
          placeholder={getExampleText()}
          value={inputText}
          onChange={handleTextChange}
          error={!!error}
          helperText={
            error || `${cleanedLength} / ${expectedLength} characters`
          }
          className={styles.textField}
          inputProps={{
            className: styles.monoInput,
            spellCheck: false,
            autoComplete: "off",
          }}
        />

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        <Box className={styles.hints}>
          <Typography variant="caption" color="text.secondary">
            Tip: Copy puzzles from websites, books, or puzzle collections. Both single-line
            format (53..7....6..195...) and multi-line grid format are supported.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={cleanedLength !== expectedLength || !!error}
        >
          Load Puzzle
        </Button>
      </DialogActions>
    </Dialog>
  );
}
