/**
 * Theme Provider Component
 *
 * Wraps the app with MUI ThemeProvider and applies custom Sudoku theme.
 */

import { useMemo, useLayoutEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useThemeStore, useEffectiveThemeMode } from "../../../store/themeStore";
import { createSudokuTheme } from "../../../styles/theme/muiTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const effectiveMode = useEffectiveThemeMode();
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const secondaryColor = useThemeStore((state) => state.secondaryColor);
  const customColors = useThemeStore((state) => state.customColors);
  const backgroundImage = useThemeStore((state) => state.backgroundImage);

  // Create theme based on current settings
  const theme = useMemo(
    () =>
      createSudokuTheme({
        mode: effectiveMode,
        primaryColor,
        secondaryColor,
        customColors,
      }),
    [effectiveMode, primaryColor, secondaryColor, customColors]
  );

  // Apply theme data attribute to document
  // useLayoutEffect ensures this runs before browser paint to prevent flash
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveMode);
  }, [effectiveMode]);

  // Apply custom CSS variables for Sudoku colors and theme-aware MUI variables
  // useLayoutEffect ensures CSS variables are set before browser paint to prevent flash
  useLayoutEffect(() => {
    const root = document.documentElement;
    const isDark = effectiveMode === "dark";

    // Default Sudoku colors based on theme mode
    const defaultColors = isDark
      ? {
          cellBackground: "#303030",
          cellBorder: "#424242",
          boxBorder: "#e0e0e0",
          givenText: "#ffffff",
          userText: "#90caf9",
          conflictBackground: "#5d4037",
          selectedBackground: "#1e3a5f",
          hintText: "#9e9e9e",
        }
      : {
          cellBackground: "#ffffff",
          cellBorder: "#bdbdbd",
          boxBorder: "#212121",
          givenText: "#000000",
          userText: "#1976d2",
          conflictBackground: "#ffcdd2",
          selectedBackground: "#e3f2fd",
          hintText: "#757575",
        };

    // Set Sudoku-specific colors (custom values override defaults)
    root.style.setProperty(
      "--sudoku-cell-bg",
      customColors.cellBackground || defaultColors.cellBackground
    );
    root.style.setProperty(
      "--sudoku-cell-border",
      customColors.cellBorder || defaultColors.cellBorder
    );
    root.style.setProperty(
      "--sudoku-box-border",
      customColors.boxBorder || defaultColors.boxBorder
    );
    root.style.setProperty(
      "--sudoku-given-text",
      customColors.givenText || defaultColors.givenText
    );
    root.style.setProperty(
      "--sudoku-user-text",
      customColors.userText || defaultColors.userText
    );
    root.style.setProperty(
      "--sudoku-conflict-bg",
      customColors.conflictBackground || defaultColors.conflictBackground
    );
    root.style.setProperty(
      "--sudoku-selected-bg",
      customColors.selectedBackground || defaultColors.selectedBackground
    );
    root.style.setProperty(
      "--sudoku-hint-text",
      customColors.hintText || defaultColors.hintText
    );

    // Set theme-aware CSS variables for MUI palette colors used in SCSS
    // These ensure proper dark mode support where SCSS uses fallback values
    root.style.setProperty(
      "--mui-palette-background-default",
      isDark ? "#121212" : "#f5f5f5"
    );
    root.style.setProperty(
      "--mui-palette-background-paper",
      isDark ? "#1e1e1e" : "#ffffff"
    );
    root.style.setProperty(
      "--mui-palette-text-primary",
      isDark ? "#ffffff" : "#000000"
    );
    root.style.setProperty(
      "--mui-palette-text-secondary",
      isDark ? "#b0b0b0" : "#666666"
    );
    root.style.setProperty(
      "--mui-palette-action-hover",
      isDark ? "#424242" : "#f5f5f5"
    );
    root.style.setProperty(
      "--mui-palette-action-selected",
      isDark ? "#505050" : "#f0f0f0"
    );
    root.style.setProperty(
      "--mui-palette-divider",
      isDark ? "#424242" : "#e0e0e0"
    );
    root.style.setProperty(
      "--sudoku-highlight-bg",
      isDark ? "#4a4a00" : "#fff9c4"
    );

    return () => {
      // Clean up custom properties on unmount
      root.style.removeProperty("--sudoku-cell-bg");
      root.style.removeProperty("--sudoku-cell-border");
      root.style.removeProperty("--sudoku-box-border");
      root.style.removeProperty("--sudoku-given-text");
      root.style.removeProperty("--sudoku-user-text");
      root.style.removeProperty("--sudoku-conflict-bg");
      root.style.removeProperty("--sudoku-selected-bg");
      root.style.removeProperty("--sudoku-hint-text");
      root.style.removeProperty("--mui-palette-background-default");
      root.style.removeProperty("--mui-palette-background-paper");
      root.style.removeProperty("--mui-palette-text-primary");
      root.style.removeProperty("--mui-palette-text-secondary");
      root.style.removeProperty("--mui-palette-action-hover");
      root.style.removeProperty("--mui-palette-action-selected");
      root.style.removeProperty("--mui-palette-divider");
      root.style.removeProperty("--sudoku-highlight-bg");
    };
  }, [customColors, effectiveMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div
        className="app-container"
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
                backgroundPosition: "center",
                minHeight: "100vh",
              }
            : {
                minHeight: "100vh",
              }
        }
      >
        {children}
      </div>
    </MuiThemeProvider>
  );
}
