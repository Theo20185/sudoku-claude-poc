/**
 * Solver Controls Component
 *
 * Controls for solving the puzzle: solve, find all solutions, auto-fill.
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  LinearProgress,
  Box,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  PlayArrow as SolveIcon,
  Search as FindAllIcon,
  AutoFixHigh as AutoFillIcon,
  Refresh as ResetIcon,
  Clear as ClearIcon,
  NavigateBefore,
  NavigateNext,
  Stop as StopIcon,
} from "@mui/icons-material";
import { usePuzzleStore } from "../../../store/puzzleStore";
import { useUIStore } from "../../../store/uiStore";
import styles from "./SolverControls.module.scss";

export function SolverControls() {
  const status = usePuzzleStore((state) => state.status);
  const solutions = usePuzzleStore((state) => state.solutions);
  const currentSolutionIndex = usePuzzleStore((state) => state.currentSolutionIndex);
  const isSearching = usePuzzleStore((state) => state.isSearching);
  const searchProgress = usePuzzleStore((state) => state.searchProgress);
  const searchResult = usePuzzleStore((state) => state.searchResult);
  const error = usePuzzleStore((state) => state.error);

  const solve = usePuzzleStore((state) => state.solve);
  const findAllSolutions = usePuzzleStore((state) => state.findAllSolutions);
  const autoFillConfident = usePuzzleStore((state) => state.autoFillConfident);
  const reset = usePuzzleStore((state) => state.reset);
  const clear = usePuzzleStore((state) => state.clear);
  const nextSolution = usePuzzleStore((state) => state.nextSolution);
  const prevSolution = usePuzzleStore((state) => state.prevSolution);
  const cancelSearch = usePuzzleStore((state) => state.cancelSearch);
  const setError = usePuzzleStore((state) => state.setError);

  const openSolutionsModal = useUIStore((state) => state.openSolutionsModal);

  const [autoFillCount, setAutoFillCount] = useState<number | null>(null);

  const handleSolve = async () => {
    setAutoFillCount(null);
    const success = await solve();
    if (!success) {
      // Error is set by the store
    }
  };

  const handleFindAll = async () => {
    setAutoFillCount(null);
    await findAllSolutions({ maxSolutions: 1000, maxTimeMs: 30000 });
  };

  const handleAutoFill = () => {
    const count = autoFillConfident();
    setAutoFillCount(count);
    if (count === 0) {
      setError("No cells with 100% confidence found");
    } else {
      setError(null);
    }
  };

  const handleReset = () => {
    setAutoFillCount(null);
    setError(null);
    reset();
  };

  const handleClear = () => {
    setAutoFillCount(null);
    setError(null);
    clear();
  };

  return (
    <Card className={styles.panel}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Controls
        </Typography>

        {/* Main action buttons */}
        <Box className={styles.mainActions}>
          <Tooltip title="Find one solution">
            <span>
              <Button
                variant="contained"
                startIcon={<SolveIcon />}
                onClick={handleSolve}
                disabled={isSearching || status === "solved"}
                fullWidth
              >
                Solve
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Find all possible solutions (up to 1000)">
            <span>
              <Button
                variant="outlined"
                startIcon={<FindAllIcon />}
                onClick={handleFindAll}
                disabled={isSearching}
                fullWidth
              >
                Find All
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Fill cells with only one possible value">
            <span>
              <Button
                variant="outlined"
                startIcon={<AutoFillIcon />}
                onClick={handleAutoFill}
                disabled={isSearching || status === "solved"}
                fullWidth
              >
                Auto-Fill
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Search progress */}
        {isSearching && (
          <Box className={styles.progress}>
            <Box className={styles.progressHeader}>
              <Typography variant="body2">Searching...</Typography>
              <IconButton size="small" onClick={cancelSearch}>
                <StopIcon fontSize="small" />
              </IconButton>
            </Box>
            <LinearProgress variant="indeterminate" />
            {searchProgress && (
              <Typography variant="caption" color="text.secondary">
                {searchProgress.solutionsFound} solutions found •{" "}
                {searchProgress.nodesExplored.toLocaleString()} nodes •{" "}
                {(searchProgress.timeElapsed / 1000).toFixed(1)}s
              </Typography>
            )}
          </Box>
        )}

        {/* Solutions navigation */}
        {solutions.length > 1 && !isSearching && (
          <Box className={styles.solutionNav}>
            <Typography variant="body2">
              Solution {currentSolutionIndex + 1} of {solutions.length}
            </Typography>
            <ButtonGroup size="small">
              <IconButton
                onClick={prevSolution}
                disabled={currentSolutionIndex === 0}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                onClick={nextSolution}
                disabled={currentSolutionIndex === solutions.length - 1}
              >
                <NavigateNext />
              </IconButton>
            </ButtonGroup>
            {searchResult?.searchLimitReached && (
              <Typography variant="caption" color="warning.main">
                Search limit reached
              </Typography>
            )}
          </Box>
        )}

        {/* Status messages */}
        {error && (
          <Alert severity="error" className={styles.alert} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {autoFillCount !== null && autoFillCount > 0 && (
          <Alert severity="success" className={styles.alert}>
            Filled {autoFillCount} cell{autoFillCount !== 1 ? "s" : ""}
          </Alert>
        )}

        {status === "solved" && (
          <Alert severity="success" className={styles.alert}>
            Puzzle solved!
          </Alert>
        )}

        {status === "no_solution" && (
          <Alert severity="warning" className={styles.alert}>
            No solution exists for this puzzle
          </Alert>
        )}

        {/* Reset/Clear buttons */}
        <Box className={styles.secondaryActions}>
          <Button
            variant="text"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            size="small"
          >
            Reset
          </Button>
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            size="small"
            color="error"
          >
            Clear All
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
