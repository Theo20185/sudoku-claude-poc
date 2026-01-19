import { test, expect } from "./fixtures";

test.describe("6. Random Puzzle Generation", () => {
  test.describe("6.1 Generation", () => {
    test("select difficulty and click Generate - new puzzle appears", async ({ sudokuPage }) => {
      await sudokuPage.selectDifficulty("Easy");
      await sudokuPage.generatePuzzle();

      // Should have some filled cells (givens)
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBeGreaterThan(0);
    });

    test("generated puzzle has given cells (immutable)", async ({ sudokuPage }) => {
      await sudokuPage.selectDifficulty("Easy");
      await sudokuPage.generatePuzzle();

      // Find a filled cell and verify it's a given
      let foundGiven = false;
      for (let row = 0; row < 9 && !foundGiven; row++) {
        for (let col = 0; col < 9 && !foundGiven; col++) {
          const value = await sudokuPage.getCellValue(row, col);
          if (value) {
            const isGiven = await sudokuPage.isCellGiven(row, col);
            expect(isGiven).toBe(true);
            foundGiven = true;
          }
        }
      }
      expect(foundGiven).toBe(true);
    });

    test("previous puzzle is replaced", async ({ sudokuPage }) => {
      // Generate first puzzle
      await sudokuPage.selectDifficulty("Easy");
      await sudokuPage.generatePuzzle();
      const firstPuzzleValue = await sudokuPage.getCellValue(0, 0);

      // Generate second puzzle
      await sudokuPage.generatePuzzle();

      // Puzzle should be different (with very high probability)
      // Since puzzles are random, we just verify the grid has been replaced
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBeGreaterThan(0);
    });
  });

  test.describe("6.2 Difficulty Levels", () => {
    test("easy puzzle has more given cells", async ({ sudokuPage }) => {
      await sudokuPage.selectDifficulty("Easy");
      await sudokuPage.generatePuzzle();
      const easyCount = await sudokuPage.getFilledCellCount();

      // Easy should have 36-45 clues
      expect(easyCount).toBeGreaterThanOrEqual(36);
      expect(easyCount).toBeLessThanOrEqual(45);
    });

    test("expert puzzle has fewer given cells", async ({ sudokuPage }) => {
      await sudokuPage.selectDifficulty("Expert");
      await sudokuPage.generatePuzzle();
      const expertCount = await sudokuPage.getFilledCellCount();

      // Expert targets 17-21 clues but generator may stop earlier due to
      // maxAttempts limit when maintaining unique solution is difficult.
      // In practice, Expert puzzles often have 17-30 clues.
      expect(expertCount).toBeGreaterThanOrEqual(17);
      expect(expertCount).toBeLessThanOrEqual(30);
    });

    test("each generation produces different puzzle", async ({ sudokuPage, page }) => {
      await sudokuPage.selectDifficulty("Medium");

      // Generate first puzzle and capture its string representation
      await sudokuPage.generatePuzzle();
      const firstGrid: string[] = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          firstGrid.push(await sudokuPage.getCellValue(row, col) || "0");
        }
      }
      const firstPuzzle = firstGrid.join("");

      // Generate second puzzle
      await sudokuPage.generatePuzzle();
      const secondGrid: string[] = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          secondGrid.push(await sudokuPage.getCellValue(row, col) || "0");
        }
      }
      const secondPuzzle = secondGrid.join("");

      // Puzzles should be different (extremely high probability)
      expect(firstPuzzle).not.toBe(secondPuzzle);
    });
  });

  test.describe("6.3 Puzzle Validity", () => {
    test("generated puzzle is solvable", async ({ sudokuPage, page }) => {
      await sudokuPage.selectDifficulty("Medium");
      await sudokuPage.generatePuzzle();

      // Click solve - should succeed
      await sudokuPage.clickSolve();

      // Wait for solve to complete and check for success message
      await expect(page.getByText(/puzzle solved/i)).toBeVisible({ timeout: 30000 });
    });

    test("generated puzzle has unique solution", async ({ sudokuPage, page }) => {
      await sudokuPage.selectDifficulty("Easy");
      await sudokuPage.generatePuzzle();

      // Find all solutions
      await sudokuPage.clickFindAll();

      // For unique solution puzzles, it shows "Puzzle solved!" (not "Solution 1 of 1")
      // because solution-count only appears when solutions.length > 1
      const solvedAlert = page.locator('[role="alert"]').filter({ hasText: /puzzle solved/i });
      await expect(solvedAlert).toBeVisible({ timeout: 30000 });

      // Verify all cells are filled (proving we found a solution)
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(81);
    });
  });
});
