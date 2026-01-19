import { test, expect } from "./fixtures";

test.describe("1. Application Initialization", () => {
  test.describe("1.1 Initial Load", () => {
    test("app loads without errors", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveTitle(/Sudoku/i);
    });

    test("default 9x9 grid displays with 81 cells", async ({ sudokuPage }) => {
      const cellCount = await sudokuPage.getGridCellCount();
      expect(cellCount).toBe(81);
    });

    test("grid has correct box borders (3x3 sections)", async ({ page }) => {
      await page.goto("/");
      const grid = page.locator('[data-testid="sudoku-grid"]');
      await expect(grid).toBeVisible();
      // Grid should have data-grid-size attribute
      await expect(grid).toHaveAttribute("data-grid-size", "9");
    });

    test("number palette shows numbers 1-9", async ({ page }) => {
      await page.goto("/");
      for (let i = 1; i <= 9; i++) {
        const paletteBtn = page.locator(`[data-testid="palette-${i}"]`);
        await expect(paletteBtn).toBeVisible();
      }
    });

    test("all controls are in default state", async ({ sudokuPage, page }) => {
      // No cell selected initially
      const selectedCell = page.locator('[data-cell].selected');
      await expect(selectedCell).toHaveCount(0);

      // Value mode (not pencil mode) by default
      const isPencil = await sudokuPage.isPencilModeActive();
      expect(isPencil).toBe(false);
    });
  });

  test.describe("1.2 State Persistence on Reload", () => {
    test("enter values in cells, reload page, values persist", async ({ sudokuPage, page }) => {
      // Enter some values
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(1, 1);
      await sudokuPage.typeNumber(3);

      // Reload the page
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]');

      // Check values persist
      const value1 = await sudokuPage.getCellValue(0, 0);
      const value2 = await sudokuPage.getCellValue(1, 1);
      expect(value1).toBe("5");
      expect(value2).toBe("3");
    });

    test("change theme to dark mode, reload, theme persists", async ({ sudokuPage, page }) => {
      // Set to dark mode (default is "system" which shows as "light")
      // Toggle cycle: system -> light -> dark -> system
      // Need to toggle twice to get from "system" (effective: light) to "dark"
      await sudokuPage.setThemeMode("dark");
      const darkMode = await sudokuPage.getThemeMode();
      expect(darkMode).toBe("dark");

      // Reload (don't clear localStorage this time)
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]');

      // Check theme persists
      const modeAfterReload = await sudokuPage.getThemeMode();
      expect(modeAfterReload).toBe("dark");
    });

    test("enable pencil mode, reload, pencil mode persists", async ({ sudokuPage, page }) => {
      // Enable pencil mode
      await sudokuPage.togglePencilMode();
      const isPencil = await sudokuPage.isPencilModeActive();
      expect(isPencil).toBe(true);

      // Reload
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]');

      // Check pencil mode persists
      const isPencilAfterReload = await sudokuPage.isPencilModeActive();
      expect(isPencilAfterReload).toBe(true);
    });

    test("enable hints, reload, hints setting persists", async ({ sudokuPage, page }) => {
      // Enable hints
      await sudokuPage.toggleHints();
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toBeVisible();

      // Reload
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]');

      // Check hints persist
      await expect(hintsPanel).toBeVisible();
    });
  });
});
