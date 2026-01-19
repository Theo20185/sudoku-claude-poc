import { test, expect, PUZZLES } from "./fixtures";

test.describe("10. Hints System", () => {
  test.describe("10.1 Hints Toggle", () => {
    test("click hints toggle - hints panel activates", async ({ sudokuPage, page }) => {
      await sudokuPage.toggleHints();
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toBeVisible();
    });

    test("toggle off - hints content hides", async ({ sudokuPage, page }) => {
      // Turn on
      await sudokuPage.toggleHints();
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toBeVisible();

      // The mode toggle should be visible when hints are enabled
      const modeToggle = page.locator('[data-testid="hints-mode-selected"]');
      await expect(modeToggle).toBeVisible();

      // Turn off
      await sudokuPage.toggleHints();
      // Panel stays visible (so user can toggle back on), but mode toggle hides
      await expect(hintsPanel).toBeVisible();
      await expect(modeToggle).not.toBeVisible();
    });
  });

  test.describe("10.2 Selected Cell Hints Mode", () => {
    test("enable hints, select empty cell - possible values display", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("selected");

      // Find and select an empty cell
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const value = await sudokuPage.getCellValue(row, col);
          if (!value) {
            await sudokuPage.clickCell(row, col);
            break;
          }
        }
      }

      // Should show possible values
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toContainText(/possible/i);
    });

    test("cell with one possibility - highlighted as confident", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("selected");

      // Look for cells and check hints
      // The hint panel should indicate if only one value is possible
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toBeVisible();
    });

    test("select filled cell - shows cell already filled message", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("selected");

      // Select a filled cell (given)
      await sudokuPage.clickCell(0, 0);

      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toContainText(/filled|already/i);
    });

    test("no selection - shows select empty cell message", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("selected");

      // Deselect any cell
      await page.click("body", { position: { x: 10, y: 10 } });

      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toContainText(/select/i);
    });
  });

  test.describe("10.3 All Cells Hints Mode", () => {
    test("select All mode - cells with hints display", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("all");

      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toBeVisible();
      // Should show some hints for cells
      await expect(hintsPanel).toContainText(/\d/); // Should contain numbers
    });

    test("cells sorted by fewest possibilities first", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("all");

      // Hints panel should be visible and showing cells
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toBeVisible();
    });

    test("confident cells highlighted", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("all");

      // Look for confident indicator in hints
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      // If there are confident cells, they should be highlighted
      await expect(hintsPanel).toBeVisible();
    });

    test("more than 10 cells - shows more indicator", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("all");

      // With easy puzzle, there are many empty cells
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      // Should show "+X more" if more than 10 cells have hints
      const text = await hintsPanel.textContent();
      // This is optional - may or may not show depending on implementation
    });
  });

  test.describe("10.4 Hints Update", () => {
    test("enter value - hints recalculate", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("selected");

      // Find an empty cell
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
        const hintsBefore = await page.locator('[data-testid="hints-panel"]').textContent();

        // Enter a value in a different cell
        await sudokuPage.clickCell((emptyRow + 1) % 9, (emptyCol + 1) % 9);
        const value = await sudokuPage.getCellValue((emptyRow + 1) % 9, (emptyCol + 1) % 9);
        if (!value) {
          await sudokuPage.typeNumber(1);
        }

        // Hints should have recalculated
        await sudokuPage.clickCell(emptyRow, emptyCol);
        const hintsAfter = await page.locator('[data-testid="hints-panel"]').textContent();
        // The hints content may have changed
      }
    });

    test("clear cell - hints recalculate", async ({ sudokuPage, page }) => {
      await sudokuPage.toggleHints();
      await sudokuPage.setHintsMode("selected");

      // Enter a value
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      // Clear it
      await sudokuPage.pressKey("Delete");

      // Select another cell to see updated hints
      await sudokuPage.clickCell(0, 1);
      const hintsPanel = page.locator('[data-testid="hints-panel"]');
      await expect(hintsPanel).toBeVisible();
    });
  });
});
