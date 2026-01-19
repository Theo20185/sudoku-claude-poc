import { test, expect, PUZZLES } from "./fixtures";

test.describe("3. Value Entry", () => {
  test.describe("3.1 Keyboard Input", () => {
    test("select cell, press 1-9 - value appears in cell", async ({ sudokuPage }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("5");
    });

    test("press Delete on filled cell - cell clears", async ({ sudokuPage }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");

      await sudokuPage.pressKey("Delete");
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");
    });

    test("press Backspace on filled cell - cell clears", async ({ sudokuPage }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(5);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");

      await sudokuPage.pressKey("Backspace");
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");
    });

    test("press number on given cell - no change", async ({ sudokuPage }) => {
      // Import a puzzle with given cells
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // Cell r0c0 has value 5 as a given
      const originalValue = await sudokuPage.getCellValue(0, 0);
      expect(originalValue).toBe("5");

      // Try to change it
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(9);

      // Should still be 5
      const valueAfter = await sudokuPage.getCellValue(0, 0);
      expect(valueAfter).toBe("5");
    });

    test("press invalid key (letter, symbol) - no change", async ({ sudokuPage }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.pressKey("a");
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");

      await sudokuPage.pressKey("!");
      expect(await sudokuPage.getCellValue(0, 0)).toBe("");
    });
  });

  test.describe("3.2 Number Palette Click", () => {
    test("select cell, click number in palette - value enters cell", async ({ sudokuPage }) => {
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.clickPaletteNumber(7);
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("7");
    });

    test("click palette number with no cell selected - no change", async ({ sudokuPage, page }) => {
      // Ensure no cell is selected
      await page.click("body", { position: { x: 10, y: 10 } });

      // Click palette number
      await sudokuPage.clickPaletteNumber(5);

      // No cell should have value 5 (grid should still be empty)
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(0);
    });

    test("click palette number on given cell - no change", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // Cell r0c0 has value 5 as a given
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.clickPaletteNumber(9);

      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("5"); // Should still be 5
    });
  });

  test.describe("3.3 Drag and Drop", () => {
    test("drag number from palette over cell - visual drop indicator shows", async ({ sudokuPage, page }) => {
      const source = page.locator('[data-testid="palette-5"]');
      const target = page.locator('[data-cell="r0c0"]');

      // Start drag
      await source.hover();
      await page.mouse.down();
      await target.hover();

      // Check for drop indicator (isOver class)
      await expect(target).toHaveClass(/dragOver|isOver/);

      await page.mouse.up();
    });

    test("drop number on empty cell - value enters cell", async ({ sudokuPage }) => {
      await sudokuPage.dragNumberToCell(5, 0, 0);
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("5");
    });

    test("drop number on filled cell - no change", async ({ sudokuPage }) => {
      // Fill a cell first
      await sudokuPage.clickCell(0, 0);
      await sudokuPage.typeNumber(3);

      // Try to drag a different number to it
      await sudokuPage.dragNumberToCell(7, 0, 0);

      // Should still be 3
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("3");
    });

    test("drop number on given cell - no change", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // Try to drag to a given cell
      await sudokuPage.dragNumberToCell(9, 0, 0);

      // Should still be original value
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("5");
    });

    test("release drag outside grid - no change", async ({ sudokuPage, page }) => {
      const source = page.locator('[data-testid="palette-5"]');

      // Drag and release outside grid
      await source.hover();
      await page.mouse.down();
      await page.mouse.move(10, 10);
      await page.mouse.up();

      // Grid should still be empty
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(0);
    });
  });
});
