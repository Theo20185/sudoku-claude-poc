/**
 * Material UI Theme Configuration
 */

import { createTheme, type ThemeOptions } from "@mui/material/styles";

export interface CustomThemeOptions {
  mode: "light" | "dark";
  primaryColor?: string;
  secondaryColor?: string;
  customColors?: {
    cellBackground?: string;
    cellBorder?: string;
    boxBorder?: string;
    givenText?: string;
    userText?: string;
    conflictBackground?: string;
    selectedBackground?: string;
    hintText?: string;
  };
}

// Extend the MUI theme with our custom Sudoku colors
declare module "@mui/material/styles" {
  interface Palette {
    sudoku: {
      cellBackground: string;
      cellBorder: string;
      boxBorder: string;
      givenText: string;
      userText: string;
      conflictBackground: string;
      selectedBackground: string;
      hintText: string;
      highlightBackground: string;
    };
  }
  interface PaletteOptions {
    sudoku?: Partial<Palette["sudoku"]>;
  }
}

const lightSudokuColors = {
  cellBackground: "#ffffff",
  cellBorder: "#bdbdbd",
  boxBorder: "#212121",
  givenText: "#000000",
  userText: "#1976d2",
  conflictBackground: "#ffcdd2",
  selectedBackground: "#e3f2fd",
  hintText: "#757575",
  highlightBackground: "#fff9c4",
};

const darkSudokuColors = {
  cellBackground: "#303030",
  cellBorder: "#424242",
  boxBorder: "#e0e0e0",
  givenText: "#ffffff",
  userText: "#90caf9",
  conflictBackground: "#5d4037",
  selectedBackground: "#1e3a5f",
  hintText: "#9e9e9e",
  highlightBackground: "#4a4a00",
};

export function createSudokuTheme(options: CustomThemeOptions) {
  const {
    mode,
    primaryColor,
    secondaryColor,
    customColors = {},
  } = options;

  const isLight = mode === "light";
  const defaultSudokuColors = isLight ? lightSudokuColors : darkSudokuColors;

  const sudokuColors = {
    ...defaultSudokuColors,
    ...customColors,
  };

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: primaryColor || (isLight ? "#1976d2" : "#90caf9"),
      },
      secondary: {
        main: secondaryColor || (isLight ? "#dc004e" : "#f48fb1"),
      },
      background: {
        default: isLight ? "#f5f5f5" : "#121212",
        paper: isLight ? "#ffffff" : "#1e1e1e",
      },
      sudoku: sudokuColors,
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      button: {
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
        },
      },
      MuiSelect: {
        defaultProps: {
          size: "small",
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
        styleOverrides: {
          tooltip: {
            fontSize: "0.875rem",
          },
        },
      },
      MuiDialog: {
        defaultProps: {
          maxWidth: "sm",
          fullWidth: true,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isLight
              ? "0 2px 4px rgba(0,0,0,0.1)"
              : "0 2px 4px rgba(0,0,0,0.3)",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}

// Create default themes
export const lightTheme = createSudokuTheme({ mode: "light" });
export const darkTheme = createSudokuTheme({ mode: "dark" });
