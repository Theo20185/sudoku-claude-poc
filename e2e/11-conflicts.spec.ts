import { test, expect } from "./fixtures";

test.describe("11. Conflict Detection", () => {
  test.describe("11.1 Row Conflicts", () => {
    test("enter duplicate value in same row - both cells show conflict", async ({ sudokuPage, page }) => {
      // Enter same value in two cells in the same row
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      await sudokuPage.clickCell(0, 5);
      await sudokuPage.typeNumber(5);

      // Both cells should show conflict
      const cell1 = page.locator('[data-cell="r0c0"]');
      const cell2 = page.locator('[data-cell="r0c5"]');

      await expect(cell1).toHaveClass(/conflict/);
      await expect(cell2).toHaveClass(/conflict/);
    });

    test("clear one duplicate - conflict styling removes", async ({ sudokuPage, page }) => {
      // Create conflict
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(0, 5);
      await sudokuPage.typeNumber(5);

      // Verify conflict
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);

      // Clear one
      await sudokuPage.pressKey("Delete");

      // Conflict should be gone
      await expect(page.locator('[data-cell="r0c0"]')).not.toHaveClass(/conflict/);
      await expect(page.locator('[data-cell="r0c5"]')).not.toHaveClass(/conflict/);
    });
  });

  test.describe("11.2 Column Conflicts", () => {
    test("enter duplicate value in same column - conflict shown", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      await sudokuPage.clickCell(5, 0);
      await sudokuPage.typeNumber(5);

      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);
      await expect(page.locator('[data-cell="r5c0"]')).toHaveClass(/conflict/);
    });

    test("clear duplicate - conflict clears", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(5, 0);
      await sudokuPage.typeNumber(5);

      await sudokuPage.pressKey("Delete");

      await expect(page.locator('[data-cell="r0c0"]')).not.toHaveClass(/conflict/);
    });
  });

  test.describe("11.3 Box Conflicts", () => {
    test("enter duplicate value in same 3x3 box - conflict shown", async ({ sudokuPage, page }) => {
      // Cells (0,0) and (1,1) are in the same box
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      await sudokuPage.clickCell(1, 1);
      await sudokuPage.typeNumber(5);

      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);
      await expect(page.locator('[data-cell="r1c1"]')).toHaveClass(/conflict/);
    });

    test("clear duplicate - conflict clears", async ({ sudokuPage, page }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(1, 1);
      await sudokuPage.typeNumber(5);

      await sudokuPage.pressKey("Delete");

      await expect(page.locator('[data-cell="r0c0"]')).not.toHaveClass(/conflict/);
    });
  });

  test.describe("11.4 Multiple Conflicts", () => {
    test("value conflicting in multiple ways - all conflicts shown", async ({ sudokuPage, page }) => {
      // Create a value that conflicts in row, column, and box
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      // Same row conflict
      await sudokuPage.clickCell(0, 8);
      await sudokuPage.typeNumber(5);

      // Same column conflict
      await sudokuPage.clickCell(8, 0);
      await sudokuPage.typeNumber(5);

      // All three should show conflict
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);
      await expect(page.locator('[data-cell="r0c8"]')).toHaveClass(/conflict/);
      await expect(page.locator('[data-cell="r8c0"]')).toHaveClass(/conflict/);
    });

    test("clearing one conflict may leave others", async ({ sudokuPage, page }) => {
      // Create multiple conflicts
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(0, 8);
      await sudokuPage.typeNumber(5);
      await sudokuPage.clickCell(8, 0);
      await sudokuPage.typeNumber(5);

      // Clear one (row conflict)
      await sudokuPage.clickCell(0, 8);
      await sudokuPage.pressKey("Delete");

      // Column conflict should still exist
      await expect(page.locator('[data-cell="r0c0"]')).toHaveClass(/conflict/);
      await expect(page.locator('[data-cell="r8c0"]')).toHaveClass(/conflict/);

      // Row conflict should be gone
      await expect(page.locator('[data-cell="r0c8"]')).not.toHaveClass(/conflict/);
    });
  });
});
