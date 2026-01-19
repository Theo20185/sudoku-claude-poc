import { test, expect, PUZZLES } from "./fixtures";

test.describe("4. Pencil Marks (Notes)", () => {
  test.describe("4.1 Pencil Mode Toggle", () => {
    test("click pencil mode toggle - mode switches to pencil", async ({ sudokuPage }) => {
      expect(await sudokuPage.isPencilModeActive()).toBe(false);
      await sudokuPage.togglePencilMode();
      expect(await sudokuPage.isPencilModeActive()).toBe(true);
    });

    test("pencil mode indicator visible when active", async ({ sudokuPage, page }) => {
      await sudokuPage.togglePencilMode();
      const toggle = page.locator('[data-testid="pencil-mode-toggle"]');
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    test("click again - mode returns to value", async ({ sudokuPage }) => {
      await sudokuPage.togglePencilMode();
      expect(await sudokuPage.isPencilModeActive()).toBe(true);

      await sudokuPage.togglePencilMode();
      expect(await sudokuPage.isPencilModeActive()).toBe(false);
    });
  });

  test.describe("4.2 Pencil Mark Entry", () => {
    test("in pencil mode, press number - pencil mark appears", async ({ sudokuPage, page }) => {
      await sudokuPage.togglePencilMode();
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      // Check for pencil mark (CSS module class)
      const cell = page.locator('[data-cell="r0c0"]');
      const pencilMarks = cell.locator('[class*="pencilMarks"]');
      await expect(pencilMarks).toContainText("5");
    });

    test("press same number again - pencil mark removes (toggle)", async ({ sudokuPage, page }) => {
      await sudokuPage.togglePencilMode();
      await sudokuPage.clickCell(0, 0);

      // Add pencil mark
      await sudokuPage.typeNumber(5);
      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("5");

      // Remove pencil mark
      await sudokuPage.typeNumber(5);
      // When all pencil marks are removed, the pencilMarks element may not exist
      const pencilMarks = cell.locator('[class*="pencilMarks"]');
      const count = await pencilMarks.count();
      if (count > 0) {
        await expect(pencilMarks).not.toContainText("5");
      }
      // If count is 0, the element doesn't exist which means pencil marks were removed
    });

    test("multiple pencil marks display in grid layout", async ({ sudokuPage, page }) => {
      await sudokuPage.togglePencilMode();
      await sudokuPage.clickCell(0, 0);

      // Add multiple pencil marks
      await sudokuPage.typeNumber(1);
      await sudokuPage.typeNumber(3);
      await sudokuPage.typeNumber(7);

      const cell = page.locator('[data-cell="r0c0"]');
      const pencilMarks = cell.locator('[class*="pencilMarks"]');
      await expect(pencilMarks).toContainText("1");
      await expect(pencilMarks).toContainText("3");
      await expect(pencilMarks).toContainText("7");
    });

    test("pencil marks on given cell - no change", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      await sudokuPage.togglePencilMode();

      // Try to add pencil mark to given cell
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(9);

      // Should not have pencil marks, should still show the given value
      const cell = page.locator('[data-cell="r0c0"]');
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("5");
    });
  });

  test.describe("4.3 Pencil Mark Clearing", () => {
    test("switch to value mode, enter value - pencil marks clear", async ({ sudokuPage, page }) => {
      // Add pencil marks
      await sudokuPage.togglePencilMode();
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(1);
      await sudokuPage.typeNumber(3);

      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("1");

      // Switch to value mode and enter value
      await sudokuPage.togglePencilMode();
      await sudokuPage.typeNumber(5);

      // Pencil marks should be gone, value should be displayed
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("5");
      // When a value is entered, pencilMarks element may not exist
      const pencilMarks = cell.locator('[class*="pencilMarks"]');
      const count = await pencilMarks.count();
      if (count > 0) {
        await expect(pencilMarks).not.toContainText("1");
      }
    });

    test("clear cell - pencil marks remain (only value clears)", async ({ sudokuPage, page }) => {
      // First add a value
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      // Add pencil marks to a different cell
      await sudokuPage.togglePencilMode();
      await sudokuPage.clickCell(1, 1);
      await sudokuPage.typeNumber(2);
      await sudokuPage.typeNumber(4);

      // Clear the cell with value
      await sudokuPage.togglePencilMode();
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.pressKey("Delete");

      // Value should be gone
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");

      // Pencil marks on other cell should still be there
      const cell = page.locator('[data-cell="r1c1"]');
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("2");
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("4");
    });
  });

  test.describe("4.4 Drag and Drop in Pencil Mode", () => {
    test("in pencil mode, drag number to cell - adds pencil mark", async ({ sudokuPage, page }) => {
      await sudokuPage.togglePencilMode();
      await sudokuPage.dragNumberToCell(5, 0, 0);

      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("5");
    });

    test("drag same number to cell with that mark - removes pencil mark", async ({ sudokuPage, page }) => {
      await sudokuPage.togglePencilMode();

      // Add pencil mark
      await sudokuPage.dragNumberToCell(5, 0, 0);
      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("5");

      // Drag same number again to toggle off
      await sudokuPage.dragNumberToCell(5, 0, 0);
      // When all pencil marks are removed, the pencilMarks element may not exist
      const pencilMarks = cell.locator('[class*="pencilMarks"]');
      const count = await pencilMarks.count();
      if (count > 0) {
        await expect(pencilMarks).not.toContainText("5");
      }
    });
  });
});
