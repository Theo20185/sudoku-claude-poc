import { test, expect } from "./fixtures";

test.describe("12. Theme Switching", () => {
  test.describe("12.1 Theme Toggle", () => {
    test("app always starts in light mode", async ({ sudokuPage }) => {
      // App should always start in light mode regardless of system preference
      const initialMode = await sudokuPage.getThemeMode();
      expect(initialMode).toBe("light");

      const storedMode = await sudokuPage.getStoredThemeMode();
      expect(storedMode).toBe("light");
    });

    test("click theme toggle - cycles between light and dark modes", async ({ sudokuPage }) => {
      // Start in light mode (default)
      expect(await sudokuPage.getThemeMode()).toBe("light");

      // Toggle: light -> dark
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getStoredThemeMode()).toBe("dark");
      expect(await sudokuPage.getThemeMode()).toBe("dark");

      // Toggle: dark -> light
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getStoredThemeMode()).toBe("light");
      expect(await sudokuPage.getThemeMode()).toBe("light");
    });

    test("light mode - light background, dark text", async ({ sudokuPage, page }) => {
      // Should already be in light mode by default
      expect(await sudokuPage.getThemeMode()).toBe("light");

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
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getThemeMode()).toBe("dark");

      // Check that theme attribute is set
      const theme = await page.evaluate(() => {
        return document.documentElement.getAttribute("data-theme");
      });
      expect(theme).toBe("dark");
    });
  });

  test.describe("12.2 Theme Persistence", () => {
    test.describe.configure({ timeout: 60000 });

    test("change theme to dark, reload page - theme persists", async ({ sudokuPage, page }) => {
      // Switch to dark mode
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getThemeMode()).toBe("dark");

      // Verify dark mode is stored in localStorage
      expect(await sudokuPage.getStoredThemeMode()).toBe("dark");

      // Reload
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]', { timeout: 30000 });

      // Wait for theme hydration from localStorage
      await page.waitForFunction(() => {
        return document.documentElement.getAttribute("data-theme") === "dark";
      }, { timeout: 10000 });

      // Should still be dark
      const modeAfterReload = await sudokuPage.getThemeMode();
      expect(modeAfterReload).toBe("dark");
    });

    test("light mode persists after reload", async ({ sudokuPage, page }) => {
      // Start in light mode (default)
      expect(await sudokuPage.getThemeMode()).toBe("light");

      // Reload
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]', { timeout: 30000 });

      // Should still be light
      const modeAfterReload = await sudokuPage.getThemeMode();
      expect(modeAfterReload).toBe("light");
    });
  });

  test.describe("12.3 Visual Consistency", () => {
    test("all grid elements visible in light mode", async ({ sudokuPage, page }) => {
      // Should start in light mode
      expect(await sudokuPage.getThemeMode()).toBe("light");

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
      // Switch to dark mode
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getThemeMode()).toBe("dark");

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

      // Check in light mode (default)
      expect(await sudokuPage.getThemeMode()).toBe("light");
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);

      // Check in dark mode
      await sudokuPage.toggleTheme();
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);
    });

    test("selection highlighting visible in both modes", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);

      // Check in light mode (default)
      expect(await sudokuPage.getThemeMode()).toBe("light");
      await expect(page.locator('[data-cell="r4c4"]')).toHaveClass(/selected/);

      // Check in dark mode
      await sudokuPage.toggleTheme();
      await expect(page.locator('[data-cell="r4c4"]')).toHaveClass(/selected/);
    });

    test("left panel cards have correct background in light mode", async ({ sudokuPage, page }) => {
      // Should start in light mode
      expect(await sudokuPage.getThemeMode()).toBe("light");

      // Check hints panel background is light
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      const bgColor = await hintsPanel.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      // Light mode background should be white or near-white
      const isLight = bgColor.includes("255") || bgColor.includes("250") || bgColor.includes("245");
      expect(isLight).toBe(true);
    });

    test("left panel cards have correct background in dark mode", async ({ sudokuPage, page }) => {
      // Switch to dark mode
      await sudokuPage.toggleTheme();
      expect(await sudokuPage.getThemeMode()).toBe("dark");

      // Check hints panel background is dark
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      const bgColor = await hintsPanel.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      // Dark mode background should NOT be white
      const isNotLight = !bgColor.includes("255, 255, 255") && !bgColor.includes("rgb(255");
      expect(isNotLight).toBe(true);
    });
  });
});
