import { test, expect } from "./fixtures";

test.describe("7. Undo/Redo", () => {
  test.describe("7.1 Undo Functionality", () => {
    test("enter value, undo - value removed", async ({ sudokuPage }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");

      await sudokuPage.clickUndo();
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");
    });

    test("undo button disabled when no history", async ({ sudokuPage }) => {
      // Fresh grid - undo should be disabled
      const isDisabled = await sudokuPage.isUndoDisabled();
      expect(isDisabled).toBe(true);
    });

    test("multiple undos work sequentially", async ({ sudokuPage }) => {
      // Enter multiple values
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(1);
      await sudokuPage.clickCell(0, 1);
      await sudokuPage.typeNumber(2);
      await sudokuPage.clickCell(0, 2);
      await sudokuPage.typeNumber(3);

      // Verify all values
      expect(await sudokuPage.getCellValue(0, 0)).toBe("1");
      expect(await sudokuPage.getCellValue(0, 1)).toBe("2");
      expect(await sudokuPage.getCellValue(0, 2)).toBe("3");

      // Undo all
      await sudokuPage.clickUndo();
      expect(await sudokuPage.getCellValue(0, 2)).toBe("");

      await sudokuPage.clickUndo();
      expect(await sudokuPage.getCellValue(0, 1)).toBe("");

      await sudokuPage.clickUndo();
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");
    });

    test("undo restores pencil marks", async ({ sudokuPage, page }) => {
      // Add pencil marks
      await sudokuPage.togglePencilMode();
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(1);
      await sudokuPage.typeNumber(3);

      const cell = page.locator('[data-cell="r0c0"]');
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("1");

      // Clear pencil mark
      await sudokuPage.typeNumber(1);
      await expect(cell.locator('[class*="pencilMarks"]')).not.toContainText("1");

      // Undo should restore it
      await sudokuPage.clickUndo();
      await expect(cell.locator('[class*="pencilMarks"]')).toContainText("1");
    });
  });

  test.describe("7.2 Redo Functionality", () => {
    test("undo, redo - value restored", async ({ sudokuPage }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");

      await sudokuPage.clickUndo();
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");

      await sudokuPage.clickRedo();
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
    });

    test("redo button disabled when at latest state", async ({ sudokuPage }) => {
      // Enter a value - redo should be disabled
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      const isDisabled = await sudokuPage.isRedoDisabled();
      expect(isDisabled).toBe(true);
    });

    test("multiple redos work sequentially", async ({ sudokuPage }) => {
      // Enter values
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(1);
      await sudokuPage.clickCell(0, 1);
      await sudokuPage.typeNumber(2);
      await sudokuPage.clickCell(0, 2);
      await sudokuPage.typeNumber(3);

      // Undo all
      await sudokuPage.clickUndo();
      await sudokuPage.clickUndo();
      await sudokuPage.clickUndo();

      // All should be empty
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");
      expect(await sudokuPage.getCellValue(0, 1)).toBe("");
      expect(await sudokuPage.getCellValue(0, 2)).toBe("");

      // Redo all
      await sudokuPage.clickRedo();
      expect(await sudokuPage.getCellValue(0, 0)).toBe("1");

      await sudokuPage.clickRedo();
      expect(await sudokuPage.getCellValue(0, 1)).toBe("2");

      await sudokuPage.clickRedo();
      expect(await sudokuPage.getCellValue(0, 2)).toBe("3");
    });
  });

  test.describe("7.3 History Branching", () => {
    test("undo, then enter new value - redo history clears", async ({ sudokuPage }) => {
      // Enter value
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);

      // Undo
      await sudokuPage.clickUndo();

      // Enter different value
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(9);

      // Redo should be disabled (future history cleared)
      const isDisabled = await sudokuPage.isRedoDisabled();
      expect(isDisabled).toBe(true);
    });

    test("redo button disabled after new action", async ({ sudokuPage }) => {
      // Enter values
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(1);
      await sudokuPage.clickCell(0, 1);
      await sudokuPage.typeNumber(2);

      // Undo once
      await sudokuPage.clickUndo();

      // Redo should be enabled
      expect(await sudokuPage.isRedoDisabled()).toBe(false);

      // Enter new value
      await sudokuPage.clickCell(0, 2);
      await sudokuPage.typeNumber(3);

      // Redo should now be disabled
      expect(await sudokuPage.isRedoDisabled()).toBe(true);
    });
  });
});
