import { test, expect } from "./fixtures";

test.describe("2. Cell Selection & Navigation", () => {
  test.describe("2.1 Mouse Selection", () => {
    test("click empty cell - cell becomes selected", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 0);
      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell).toHaveClass(/selected/);
    });

    test("click different cell - previous deselects, new cell selects", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 0);
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/selected/);

      await sudokuPage.clickCell(1, 1);
      await expect(page.locator('[data-cell="r0c0"]')).not.toHaveClass(/selected/);
      await expect(page.locator('[data-cell="r1c1"]')).toHaveClass(/selected/);
    });

    test("click same cell twice - cell remains selected", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.clickCell(0, 0);
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/selected/);
    });

    test("click outside grid - cell deselects", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 0);
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/selected/);

      // Click outside the grid
      await page.click("body", { position: { x: 10, y: 10 } });
      await expect(page.locator('[data-cell="r0c0"]')).not.toHaveClass(/selected/);
    });
  });

  test.describe("2.2 Related Cell Highlighting", () => {
    test("select cell - all cells in same row highlight", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);

      // All cells in row 4 should be related
      for (let col = 0; col < 9; col++) {
        if (col !== 4) {
          await expect(page.locator(`[data-cell="r4c${col}"]`)).toHaveClass(/related/);
        }
      }
    });

    test("select cell - all cells in same column highlight", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);

      // All cells in column 4 should be related
      for (let row = 0; row < 9; row++) {
        if (row !== 4) {
          await expect(page.locator(`[data-cell="r${row}c4"]`)).toHaveClass(/related/);
        }
      }
    });

    test("select cell - all cells in same 3x3 box highlight", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);

      // All cells in center box (rows 3-5, cols 3-5) should be related
      for (let row = 3; row <= 5; row++) {
        for (let col = 3; col <= 5; col++) {
          if (row !== 4 || col !== 4) {
            await expect(page.locator(`[data-cell="r${row}c${col}"]`)).toHaveClass(/related/);
          }
        }
      }
    });
  });

  test.describe("2.3 Keyboard Navigation", () => {
    test("Arrow Up - selection moves up one row", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);
      await sudokuPage.navigateUp();
      await expect(page.locator('[data-cell="r3c4"]')).toHaveClass(/selected/);
    });

    test("Arrow Down - selection moves down one row", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);
      await sudokuPage.navigateDown();
      await expect(page.locator('[data-cell="r5c4"]')).toHaveClass(/selected/);
    });

    test("Arrow Left - selection moves left one column", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);
      await sudokuPage.navigateLeft();
      await expect(page.locator('[data-cell="r4c3"]')).toHaveClass(/selected/);
    });

    test("Arrow Right - selection moves right one column", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 4);
      await sudokuPage.navigateRight();
      await expect(page.locator('[data-cell="r4c5"]')).toHaveClass(/selected/);
    });

    test("Arrow Up from row 0 - wraps to row 8", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 4);
      await sudokuPage.navigateUp();
      await expect(page.locator('[data-cell="r8c4"]')).toHaveClass(/selected/);
    });

    test("Arrow Down from row 8 - wraps to row 0", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(8, 4);
      await sudokuPage.navigateDown();
      await expect(page.locator('[data-cell="r0c4"]')).toHaveClass(/selected/);
    });

    test("Arrow Left from col 0 - wraps to col 8", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 0);
      await sudokuPage.navigateLeft();
      await expect(page.locator('[data-cell="r4c8"]')).toHaveClass(/selected/);
    });

    test("Arrow Right from col 8 - wraps to col 0", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(4, 8);
      await sudokuPage.navigateRight();
      await expect(page.locator('[data-cell="r4c0"]')).toHaveClass(/selected/);
    });
  });
});
