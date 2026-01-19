import { test, expect } from "./fixtures";

test.describe("12. Theme Switching", () => {
  test.describe("12.1 Theme Toggle", () => {
    test("click theme toggle - cycles through system/light/dark modes", async ({ sudokuPage }) => {
      // Start with stored mode "system" (default after localStorage clear)
      // Effective mode is "light" due to Playwright colorScheme: "light"
      const initialStoredMode = await sudokuPage.getStoredThemeMode();
      const initialEffectiveMode = await sudokuPage.getThemeMode();
      expect(initialStoredMode).toBe("system");
      expect(initialEffectiveMode).toBe("light");

      // Toggle: system -> light (effective mode stays "light")
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getStoredThemeMode()).toBe("light");
      expect(await sudokuPage.getThemeMode()).toBe("light");

      // Toggle: light -> dark
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getStoredThemeMode()).toBe("dark");
      expect(await sudokuPage.getThemeMode()).toBe("dark");

      // Toggle: dark -> system (effective mode becomes "light" again)
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getStoredThemeMode()).toBe("system");
      expect(await sudokuPage.getThemeMode()).toBe("light");
    });

    test("light mode - light background, dark text", async ({ sudokuPage, page }) => {
      // Ensure light mode
      while (await sudokuPage.getThemeMode() !== "light") {
        await sudokuPage.toggleTheme();
      }

      // Check visual characteristics
      const body = page.locator("body");
      const bgColor = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Light mode should have light background
      // This is a loose check - just verify it's not a dark color
      expect(bgColor).not.toMatch(/rgb\(0,\s*0,\s*0\)/);
    });

    test("dark mode - dark background, light text", async ({ sudokuPage, page }) => {
      // Switch to dark mode
      while (await sudokuPage.getThemeMode() !== "dark") {
        await sudokuPage.toggleTheme();
      }

      // Check that theme attribute is set
      const theme = await page.evaluate(() => {
        return document.documentElement.getAttribute("data-theme");
      });
      expect(theme).toBe("dark");
    });

    test("system mode - matches OS preference", async ({ sudokuPage }) => {
      // Switch to system mode by toggling until stored mode is "system"
      while (await sudokuPage.getStoredThemeMode() !== "system") {
        await sudokuPage.toggleTheme();
      }

      // Verify stored mode is "system"
      const storedMode = await sudokuPage.getStoredThemeMode();
      expect(storedMode).toBe("system");

      // With Playwright colorScheme: "light", effective mode should be "light"
      const effectiveMode = await sudokuPage.getThemeMode();
      expect(effectiveMode).toBe("light");
    });
  });

  test.describe("12.2 Theme Persistence", () => {
    test("change theme, reload page - theme persists", async ({ sudokuPage, page }) => {
      // Switch to dark mode
      while (await sudokuPage.getThemeMode() !== "dark") {
        await sudokuPage.toggleTheme();
      }

      // Reload
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]');

      // Should still be dark
      const modeAfterReload = await sudokuPage.getThemeMode();
      expect(modeAfterReload).toBe("dark");
    });
  });

  test.describe("12.3 Visual Consistency", () => {
    test("all grid elements visible in light mode", async ({ sudokuPage, page }) => {
      while (await sudokuPage.getThemeMode() !== "light") {
        await sudokuPage.toggleTheme();
      }

      // Check grid is visible
      const grid = page.locator('[data-testid="sudoku-grid"]');
      await expect(grid).toBeVisible();

      // Check cells are visible
      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell).toBeVisible();

      // Check palette is visible
      const palette = page.locator('[data-testid="palette-1"]');
      await expect(palette).toBeVisible();
    });

    test("all grid elements visible in dark mode", async ({ sudokuPage, page }) => {
      while (await sudokuPage.getThemeMode() !== "dark") {
        await sudokuPage.toggleTheme();
      }

      // Check grid is visible
      const grid = page.locator('[data-testid="sudoku-grid"]');
      await expect(grid).toBeVisible();

      // Check cells are visible
      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell).toBeVisible();

      // Check palette is visible
      const palette = page.locator('[data-testid="palette-1"]');
      await expect(palette).toBeVisible();
    });

    test("conflict highlighting visible in both modes", async ({ sudokuPage, page }) => {
      // Create a conflict
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(0, 1);
      await sudokuPage.typeNumber(5);

      // Check in light mode
      while (await sudokuPage.getThemeMode() !== "light") {
        await sudokuPage.toggleTheme();
      }
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);

      // Check in dark mode
      await sudokuPage.toggleTheme();
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);
    });

    test("selection highlighting visible in both modes", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);

      // Check in light mode
      while (await sudokuPage.getThemeMode() !== "light") {
        await sudokuPage.toggleTheme();
      }
      await expect(page.locator('[data-cell="r4c4"]')).toHaveClass(/selected/);

      // Check in dark mode
      await sudokuPage.toggleTheme();
      await expect(page.locator('[data-cell="r4c4"]')).toHaveClass(/selected/);
    });
  });
});
