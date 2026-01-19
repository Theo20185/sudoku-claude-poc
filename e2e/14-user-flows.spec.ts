import { test, expect, PUZZLES } from "./fixtures";

test.describe("14. Complete User Flows", () => {
  test.describe("14.1 Solve Imported Puzzle", () => {
    test("complete flow: import, verify, solve", async ({ sudokuPage, page }) => {
      // 1. Click Import Puzzle
      await sudokuPage.openImportDialog();
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // 2. Paste valid puzzle string
      await page.fill("textarea", PUZZLES.easy);

      // 3. Click Load
      await page.click('button:has-text("Load Puzzle")');

      // 4. Verify puzzle displays
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");

      // 5. Click Solve
      await sudokuPage.clickSolve();

      // 6. Verify solution displays
      await expect(page.getByText(/puzzle solved/i)).toBeVisible({ timeout: 30000 });

      // 7. All cells should be filled
      expect(await sudokuPage.getFilledCellCount()).toBe(81);
    });
  });

  test.describe("14.2 Manual Solve with Hints", () => {
    test("complete flow: generate, use hints, enter values", async ({ sudokuPage, page }) => {
      // 1. Generate Easy puzzle
      await sudokuPage.selectDifficulty("Easy");
      await sudokuPage.generatePuzzle();

      // 2. Enable hints (Selected mode)
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("selected");

      // 3. Find and select empty cell
      let emptyRow = -1, emptyCol = -1;
      for (let row = 0; row < 9 && emptyRow < 0; row++) {
        for (let col = 0; col < 9 && emptyRow < 0; col++) {
          const value = await sudokuPage.getCellValue(row, col);
          if (!value) {
            emptyRow = row;
            emptyCol = col;
          }
        }
      }

      if (emptyRow >= 0) {
        await sudokuPage.clickCell(emptyRow, emptyCol);

        // 4. View possible values in hints
        const hintsPanel = page.locator('[data-testid="hints-panel"]');
        await expect(hintsPanel).toBeVisible();

        // 5. Enter value (pick first possible value from hints or just try 1)
        await sudokuPage.typeNumber(1);
      }

      // Verify we can interact with the puzzle
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBeGreaterThan(0);
    });
  });

  test.describe("14.3 Explore Multiple Solutions", () => {
    test("complete flow: import multi-solution puzzle, find all, navigate", async ({ sudokuPage, page }) => {
      // 1. Import puzzle with multiple solutions (nearly empty)
      const fewGivens = "500000000000000000000000000000000000000000000000000000000000000000000000000000000";
      await sudokuPage.importPuzzle(fewGivens);

      // 2. Click Find All Solutions
      await sudokuPage.clickFindAll();

      // 3. Wait for search completion (with timeout for limit)
      await page.waitForSelector('[data-testid="solution-count"]', { timeout: 60000 });

      // 4. Should show multiple solutions
      const solutionText = await page.locator('[data-testid="solution-count"]').textContent();
      expect(solutionText).toMatch(/Solution \d+ of \d+/);

      // 5. Navigate with Previous/Next if available
      const nextBtn = page.locator('[data-testid="next-solution-btn"]');
      if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        const valueBefore = await sudokuPage.getCellValue(0, 1);
        await nextBtn.click();
        // Solution may have changed
      }
    });
  });

  test.describe("14.4 Undo/Redo Workflow", () => {
    test("complete flow: enter values, undo, redo, branch history", async ({ sudokuPage }) => {
      // 1. Generate puzzle
      await sudokuPage.selectDifficulty("Easy");
      await sudokuPage.generatePuzzle();

      // Find 5 empty cells and fill them
      const filledCells: Array<{ row: number; col: number; value: number }> = [];
      let valueToEnter = 1;

      for (let row = 0; row < 9 && filledCells.length < 5; row++) {
        for (let col = 0; col < 9 && filledCells.length < 5; col++) {
          const value = await sudokuPage.getCellValue(row, col);
          if (!value) {
            await sudokuPage.clickCell(row, col);
            await sudokuPage.typeNumber(valueToEnter);
            filledCells.push({ row, col, value: valueToEnter });
            valueToEnter = (valueToEnter % 9) + 1;
          }
        }
      }

      // 2. Verify 5 values entered
      expect(filledCells.length).toBe(5);

      // 3. Undo 3 times
      await sudokuPage.clickUndo();
      await sudokuPage.clickUndo();
      await sudokuPage.clickUndo();

      // 4. Verify only 2 values remain
      let remainingValues = 0;
      for (const cell of filledCells.slice(0, 2)) {
        const value = await sudokuPage.getCellValue(cell.row, cell.col);
        if (value) remainingValues++;
      }
      expect(remainingValues).toBe(2);

      // 5. Redo 2 times
      await sudokuPage.clickRedo();
      await sudokuPage.clickRedo();

      // 6. Verify 4 values present
      remainingValues = 0;
      for (const cell of filledCells.slice(0, 4)) {
        const value = await sudokuPage.getCellValue(cell.row, cell.col);
        if (value) remainingValues++;
      }
      expect(remainingValues).toBe(4);

      // 7. Enter new value
      const lastCell = filledCells[4];
      await sudokuPage.clickCell(lastCell.row, lastCell.col);
      await sudokuPage.typeNumber(9);

      // 8. Verify redo disabled
      expect(await sudokuPage.isRedoDisabled()).toBe(true);
    });
  });

  test.describe("14.5 Theme Persistence Workflow", () => {
    test("complete flow: switch theme, enter values, reload, verify both persist", async ({ sudokuPage, page }) => {
      // 1. Switch to dark mode
      while (await sudokuPage.getThemeMode() !== "dark") {
        await sudokuPage.toggleTheme();
      }

      // 2. Enter some values
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(1, 1);
      await sudokuPage.typeNumber(3);

      // 3. Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="sudoku-grid"]');

      // 4. Verify dark mode persists
      expect(await sudokuPage.getThemeMode()).toBe("dark");

      // 5. Verify entered values persist
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
      expect(await sudokuPage.getCellValue(1, 1)).toBe("3");
    });
  });
});
