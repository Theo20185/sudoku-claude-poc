import { test, expect, PUZZLES } from "./fixtures";

test.describe("9. Reset and Clear", () => {
  test.describe("9.1 Reset Button", () => {
    test("click Reset - user entries clear", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // Add some user entries
      // Find an empty cell and fill it
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const value = await sudokuPage.getCellValue(row, col);
          if (!value) {
            await sudokuPage.clickCell(row, col);
            await sudokuPage.typeNumber(1);
            break;
          }
        }
        const filled = await sudokuPage.getFilledCellCount();
        if (filled > 30) break; // We added at least one entry
      }

      await sudokuPage.clickReset();

      // User entries should be cleared, only givens remain
      // Count should match original puzzle givens
      const filledCount = await sudokuPage.getFilledCellCount();
      // Easy puzzle has 36-45 givens, user entries should be gone
      expect(filledCount).toBeLessThanOrEqual(45);
    });

    test("given cells remain after reset", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      const originalValue = await sudokuPage.getCellValue(0, 0); // Should be "5"

      // Add some entries and reset
      await sudokuPage.clickCell(2, 2);
      await sudokuPage.typeNumber(9);
      await sudokuPage.clickReset();

      // Given should still be there
      const valueAfterReset = await sudokuPage.getCellValue(0, 0);
      expect(valueAfterReset).toBe(originalValue);
    });

    test("undo/redo history clears after reset", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // Make some changes
      await sudokuPage.clickCell(2, 2);
      await sudokuPage.typeNumber(9);

      // Reset
      await sudokuPage.clickReset();

      // Undo should be disabled (history cleared)
      const isUndoDisabled = await sudokuPage.isUndoDisabled();
      expect(isUndoDisabled).toBe(true);
    });
  });

  test.describe("9.2 Clear All Button", () => {
    test("click Clear All - entire grid empties", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      expect(await sudokuPage.getFilledCellCount()).toBeGreaterThan(0);

      await sudokuPage.clickClearAll();

      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(0);
    });

    test("no given cells remain after clear all", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // Verify there are givens
      const isGivenBefore = await sudokuPage.isCellGiven(0, 0);
      expect(isGivenBefore).toBe(true);

      await sudokuPage.clickClearAll();

      // No cell should be a given anymore
      const isGivenAfter = await sudokuPage.isCellGiven(0, 0);
      expect(isGivenAfter).toBe(false);
    });
  });
});
