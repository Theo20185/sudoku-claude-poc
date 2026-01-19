/**
 * Hints Panel Component
 *
 * Shows possible values for selected or all cells.
 */

import { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Divider,
  Box,
} from "@mui/material";
import { Lightbulb as LightbulbIcon } from "@mui/icons-material";
import { usePuzzleStore } from "../../../store/puzzleStore";
import { useUIStore } from "../../../store/uiStore";
import { coordToId, valueToSymbol } from "../../../core/utils/gridHelpers";
import type { HintsMode } from "../../../core/models/types";
import styles from "./HintsPanel.module.scss";

export function HintsPanel() {
  const gridSize = usePuzzleStore((state) => state.gridSize);
  const cells = usePuzzleStore((state) => state.cells);
  const selectedCell = useUIStore((state) => state.selectedCell);
  const showHints = useUIStore((state) => state.showHints);
  const hintsMode = useUIStore((state) => state.hintsMode);
  const toggleHints = useUIStore((state) => state.toggleHints);
  const setHintsMode = useUIStore((state) => state.setHintsMode);

  // Get hints for selected cell
  const selectedCellHints = useMemo(() => {
    if (!selectedCell) return null;
    const cell = cells.get(coordToId(selectedCell));
    if (!cell || cell.value !== null) return null;

    return {
      coordinate: selectedCell,
      possibleValues: Array.from(cell.possibleValues).sort((a, b) => a - b),
      isConfident: cell.possibleValues.size === 1,
    };
  }, [selectedCell, cells]);

  // Get all cells with hints
  const allCellsWithHints = useMemo(() => {
    if (hintsMode !== "all") return [];

    return Array.from(cells.values())
      .filter((cell) => cell.value === null && cell.possibleValues.size > 0)
      .map((cell) => ({
        id: cell.id,
        coordinate: cell.coordinate,
        possibleValues: Array.from(cell.possibleValues).sort((a, b) => a - b),
        isConfident: cell.possibleValues.size === 1,
      }))
      .sort((a, b) => a.possibleValues.length - b.possibleValues.length);
  }, [cells, hintsMode]);

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: HintsMode | null
  ) => {
    if (newMode !== null) {
      setHintsMode(newMode);
    }
  };

  return (
    <Card className={styles.panel} data-testid="hints-panel">
      <CardContent>
        <Box className={styles.header}>
          <Box className={styles.titleRow}>
            <LightbulbIcon color="primary" />
            <Typography variant="h6" component="h2">
              Hints
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={showHints}
                onChange={toggleHints}
                size="small"
                data-testid="hints-toggle"
              />
            }
            label=""
          />
        </Box>

        {showHints && (
          <>
            <ToggleButtonGroup
              value={hintsMode}
              exclusive
              onChange={handleModeChange}
              size="small"
              fullWidth
              className={styles.modeToggle}
            >
              <ToggleButton value="selected" data-testid="hints-mode-selected">Selected</ToggleButton>
              <ToggleButton value="all" data-testid="hints-mode-all">All</ToggleButton>
              <ToggleButton value="none" data-testid="hints-mode-none">None</ToggleButton>
            </ToggleButtonGroup>

            <Divider className={styles.divider} />

            {hintsMode === "none" && (
              <Typography variant="body2" color="text.secondary" className={styles.message}>
                Hints are hidden
              </Typography>
            )}

            {hintsMode === "selected" && (
              <>
                {selectedCellHints ? (
                  <Box className={styles.hintContent}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cell ({selectedCellHints.coordinate.row + 1},{" "}
                      {selectedCellHints.coordinate.col + 1})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Possible values:
                    </Typography>
                    <Box className={styles.chips}>
                      {selectedCellHints.possibleValues.map((value) => (
                        <Chip
                          key={value}
                          label={valueToSymbol(value, gridSize)}
                          size="small"
                          color={selectedCellHints.isConfident ? "primary" : "default"}
                          variant={selectedCellHints.isConfident ? "filled" : "outlined"}
                        />
                      ))}
                    </Box>
                    {selectedCellHints.isConfident && (
                      <Typography
                        variant="caption"
                        color="success.main"
                        className={styles.confident}
                      >
                        Only one possible value!
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" className={styles.message}>
                    {selectedCell
                      ? "Cell already filled"
                      : "Select an empty cell to see hints"}
                  </Typography>
                )}
              </>
            )}

            {hintsMode === "all" && (
              <Box className={styles.allHints}>
                {allCellsWithHints.length > 0 ? (
                  allCellsWithHints.slice(0, 10).map((hint) => (
                    <Box key={hint.id} className={styles.hintItem}>
                      <Typography variant="caption" className={styles.cellLabel}>
                        ({hint.coordinate.row + 1}, {hint.coordinate.col + 1})
                      </Typography>
                      <Box className={styles.hintValues}>
                        {hint.possibleValues.map((v) => (
                          <span
                            key={v}
                            className={`${styles.hintValue} ${
                              hint.isConfident ? styles.confident : ""
                            }`}
                          >
                            {valueToSymbol(v, gridSize)}
                          </span>
                        ))}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No empty cells
                  </Typography>
                )}
                {allCellsWithHints.length > 10 && (
                  <Typography variant="caption" color="text.secondary">
                    +{allCellsWithHints.length - 10} more cells...
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
