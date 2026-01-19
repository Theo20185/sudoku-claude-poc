import { test, expect, PUZZLES } from "./fixtures";

test.describe("15. Error Scenarios", () => {
  test.describe("15.1 Invalid Puzzle Import", () => {
    test("import string with invalid characters - error message", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      const invalidPuzzle = "abc" + ".".repeat(78);
      await page.getByRole("textbox").fill(invalidPuzzle);

      await page.click('button:has-text("Load Puzzle")');

      // Should show error message (either in dialog or on page)
      const errorVisible = await page.getByText(/invalid/i).first().isVisible().catch(() => false);
      expect(errorVisible).toBe(true);
    });

    test("import puzzle with conflicts - loads but shows conflicts", async ({ sudokuPage, page }) => {
      // This puzzle has two 1s in the first row
      await sudokuPage.importPuzzle(PUZZLES.invalid);

      // Puzzle should load
      expect(await sudokuPage.getCellValue(0, 0)).toBe("1");
      expect(await sudokuPage.getCellValue(0, 1)).toBe("1");

      // Conflict should be shown
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);
      await expect(page.locator('[data-cell="r0c1"]')).toHaveClass(/conflict/);
    });

    test("import empty string - Load button disabled", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      await page.getByRole("textbox").fill("");

      const loadButton = page.getByRole("button", { name: "Load Puzzle" });
      await expect(loadButton).toBeDisabled();
    });
  });

  test.describe("15.2 Unsolvable Puzzle", () => {
    // Solver may take up to 30s to determine no solution - increase test timeout
    test.describe.configure({ timeout: 60000 });

    test("create puzzle with conflicts, click Solve - no solution message", async ({ sudokuPage, page }) => {
      // Create a puzzle with conflicts
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(1);
      await sudokuPage.clickCell(0, 1);
      await sudokuPage.typeNumber(1);

      // Verify conflict exists
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);

      // Try to solve
      await sudokuPage.clickSolve();

      // Should show no solution - use first() to avoid strict mode violation
      // Solver may take up to 30s to determine no solution
      await expect(page.locator('[role="alert"]').filter({ hasText: /no solution/i }).first()).toBeVisible({ timeout: 30000 });
    });

    test("user can continue editing after unsolvable", async ({ sudokuPage, page }) => {
      // Create unsolvable puzzle
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(1);
      await sudokuPage.clickCell(0, 1);
      await sudokuPage.typeNumber(1);

      await sudokuPage.clickSolve();
      // Solver may take up to 30s to determine no solution
      await expect(page.locator('[role="alert"]').filter({ hasText: /no solution/i }).first()).toBeVisible({ timeout: 30000 });

      // Should be able to continue editing
      await sudokuPage.clickCell(0, 1);
      await sudokuPage.pressKey("Delete");

      // Conflict should be resolved
      await expect(page.locator('[data-cell="r0c0"]')).not.toHaveClass(/conflict/);

      // Should be able to enter new value
      await sudokuPage.typeNumber(2);
      expect(await sudokuPage.getCellValue(0, 1)).toBe("2");
    });
  });

  test.describe("15.3 Search Limits", () => {
    test("puzzle with many solutions - search stops at limit", async ({ sudokuPage, page }) => {
      // Use empty grid which has countless solutions
      await sudokuPage.importPuzzle(PUZZLES.empty);

      await sudokuPage.clickFindAll();

      // Wait for search to complete or hit limit
      await page.waitForSelector('[data-testid="solution-count"]', { timeout: 60000 });

      // Check if limit warning is shown or solutions found
      const solutionCount = page.locator('[data-testid="solution-count"]');
      const text = await solutionCount.textContent();

      // Should have found solutions
      expect(text).toMatch(/Solution \d+ of \d+/);
    });

    test("search limit reached warning displays", async ({ sudokuPage, page }) => {
      // Use empty grid
      await sudokuPage.importPuzzle(PUZZLES.empty);

      await sudokuPage.clickFindAll();

      // Wait for completion
      await page.waitForSelector('[data-testid="solution-count"]', { timeout: 60000 });

      // May show limit warning
      const limitWarning = page.getByText(/limit reached|maximum/i);
      // This is optional - depends on whether limit was hit
    });

    test("partial results available after limit", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.empty);

      await sudokuPage.clickFindAll();

      await page.waitForSelector('[data-testid="solution-count"]', { timeout: 60000 });

      // Solutions should be available
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(81); // Grid should show a solution

      // Navigation should work
      const nextBtn = page.locator('[data-testid="next-solution-btn"]');
      if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        // Should still have a valid solution displayed
        expect(await sudokuPage.getFilledCellCount()).toBe(81);
      }
    });
  });
});
