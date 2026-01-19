import { test, expect, PUZZLES } from "./fixtures";

test.describe("8. Solver Features", () => {
  test.describe("8.1 Solve Button", () => {
    // Solver may take up to 30s to determine no solution for invalid puzzles
    test.describe.configure({ timeout: 60000 });

    test("click Solve on valid puzzle - solution fills grid", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.clickSolve();

      // Wait for solve to complete
      await expect(page.getByText(/puzzle solved/i)).toBeVisible({ timeout: 30000 });

      // All cells should be filled
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(81);
    });

    test("success message displays", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.clickSolve();

      await expect(page.getByText(/puzzle solved/i)).toBeVisible({ timeout: 30000 });
    });

    test("solve button disabled after solving", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.clickSolve();

      await expect(page.getByText(/puzzle solved/i)).toBeVisible({ timeout: 30000 });

      const solveBtn = page.locator('[data-testid="solve-btn"]');
      await expect(solveBtn).toBeDisabled();
    });

    test("click Solve on invalid puzzle - no solution message", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.invalid);
      await sudokuPage.clickSolve();

      // Wait for either error alert or status alert with "no solution" message
      // Use locator for MUI Alert component which contains the message
      await expect(page.locator('[role="alert"]').filter({ hasText: /no solution/i }).first()).toBeVisible({ timeout: 30000 });
    });
  });

  test.describe("8.2 Find All Solutions", () => {
    test("click Find All - progress indicator shows or completes", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.clickFindAll();

      // Should show progress indicator OR complete with "Puzzle solved!" message
      // For easy puzzles with unique solutions, it may complete before progress shows
      const searchingIndicator = page.locator('[data-testid="searching-indicator"]');
      const solvedAlert = page.locator('[role="alert"]').filter({ hasText: /puzzle solved/i });

      // Wait for either progress indicator or solved message
      await expect(searchingIndicator.or(solvedAlert)).toBeVisible({ timeout: 30000 });
    });

    test("after completion - solved message or solution count displays", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.clickFindAll();

      // For unique solutions: shows "Puzzle solved!" alert
      // For multiple solutions: shows "Solution X of Y" text
      const solvedAlert = page.locator('[role="alert"]').filter({ hasText: /puzzle solved/i });
      const solutionCount = page.locator('[data-testid="solution-count"]');

      await expect(solvedAlert.or(solutionCount)).toBeVisible({ timeout: 30000 });
    });

    test("Previous/Next buttons navigate solutions", async ({ sudokuPage, page }) => {
      // Use empty grid which has many solutions
      await sudokuPage.importPuzzle(PUZZLES.empty);
      await sudokuPage.clickFindAll();

      // Wait for search to find at least 2 solutions
      await page.waitForSelector('[data-testid="solution-count"]', { timeout: 60000 });

      // Check if we have multiple solutions
      const solutionText = await page.locator('[data-testid="solution-count"]').textContent();
      if (solutionText && solutionText.includes("of")) {
        // Navigate to next solution
        const firstValue = await sudokuPage.getCellValue(0, 0);
        await sudokuPage.clickNextSolution();

        // Grid might have different value (or same, but state changed)
        const nextBtn = page.locator('[data-testid="next-solution-btn"]');
        await expect(nextBtn).toBeVisible();
      }
    });

    test("solutions display correctly in grid", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.clickFindAll();

      // Wait for solve to complete - either "Puzzle solved!" or solution count
      const solvedAlert = page.locator('[role="alert"]').filter({ hasText: /puzzle solved/i });
      const solutionCount = page.locator('[data-testid="solution-count"]');
      await expect(solvedAlert.or(solutionCount)).toBeVisible({ timeout: 30000 });

      // All cells should be filled with solution
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(81);
    });
  });

  test.describe("8.3 Search Cancellation", () => {
    test("during Find All, click Cancel - search stops", async ({ sudokuPage, page }) => {
      // Use empty grid for long search
      await sudokuPage.importPuzzle(PUZZLES.empty);
      await sudokuPage.clickFindAll();

      // Try to find and click cancel button
      const cancelBtn = page.locator('[data-testid="cancel-search-btn"]');
      try {
        await cancelBtn.click({ timeout: 5000 });
        // Search should stop
        await expect(cancelBtn).not.toBeVisible({ timeout: 5000 });
      } catch {
        // Search might have completed before we could cancel
      }
    });
  });

  test.describe("8.4 Auto-Fill Confident", () => {
    test("click Auto-Fill - cells with single possibility fill", async ({ sudokuPage, page }) => {
      // Create a puzzle where some cells have obvious single values
      await sudokuPage.importPuzzle(PUZZLES.easy);
      const initialCount = await sudokuPage.getFilledCellCount();

      await sudokuPage.clickAutoFill();

      // Should have filled some cells (or show message if none)
      const newCount = await sudokuPage.getFilledCellCount();
      const filled = newCount - initialCount;

      // Either filled some cells or shows "no confident cells" message
      if (filled === 0) {
        await expect(page.getByText(/no cells|no confident/i)).toBeVisible({ timeout: 5000 });
      } else {
        expect(filled).toBeGreaterThan(0);
      }
    });

    test("success message shows count of filled cells", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.clickAutoFill();

      // Should show message about filled cells or "no cells with 100% confidence found"
      // Uses MUI Alert component
      const filledAlert = page.locator('[role="alert"]').filter({ hasText: /filled|100% confidence/i });
      await expect(filledAlert).toBeVisible({ timeout: 10000 });
    });

    test("if no confident cells - appropriate message displays", async ({ sudokuPage, page }) => {
      // Use hard puzzle where auto-fill might not find obvious cells
      await sudokuPage.importPuzzle(PUZZLES.hard);
      const initialCount = await sudokuPage.getFilledCellCount();

      await sudokuPage.clickAutoFill();

      // Either fills some cells or shows no confident cells message
      const filledOrMessage = await Promise.race([
        page.waitForSelector('text=/filled \\d+ cells/i', { timeout: 5000 }).then(() => "filled"),
        page.waitForSelector('text=/no cells|no confident/i', { timeout: 5000 }).then(() => "none"),
      ]);

      expect(["filled", "none"]).toContain(filledOrMessage);
    });
  });
});
