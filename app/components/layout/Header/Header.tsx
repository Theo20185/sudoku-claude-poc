/**
 * Header Component
 *
 * Application header with logo and theme toggle.
 */

import { AppBar, Toolbar, Typography, IconButton, Tooltip } from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { useThemeStore, useEffectiveThemeMode } from "../../../store/themeStore";
import styles from "./Header.module.scss";

export function Header() {
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const effectiveMode = useEffectiveThemeMode();

  return (
    <AppBar position="static" className={styles.header} elevation={1}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" component="h1" className={styles.title}>
          Sudoku
        </Typography>

        <div className={styles.actions}>
          <Tooltip title={`Switch to ${effectiveMode === "light" ? "dark" : "light"} mode`}>
            <IconButton
              color="inherit"
              onClick={toggleMode}
              aria-label="Toggle theme"
              data-testid="theme-toggle"
            >
              {effectiveMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
    </AppBar>
  );
}
