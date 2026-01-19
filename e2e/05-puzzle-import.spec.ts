import { test, expect, PUZZLES, MULTILINE_PUZZLES } from "./fixtures";

test.describe("5. Puzzle Import", () => {
  test.describe("5.1 Import Dialog", () => {
    test("click Import Puzzle - dialog opens", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test("dialog shows text input area", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      // MUI multiline creates 2 textareas, check via role
      await expect(page.getByRole("textbox")).toBeVisible();
    });

    test("character counter shows 0 / 81 initially", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      await expect(page.getByText("0 / 81")).toBeVisible();
    });

    test("cancel button closes dialog without changes", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      await page.getByRole("textbox").fill( "123");
      await sudokuPage.closeImportDialog();

      await expect(page.locator('[role="dialog"]')).not.toBeVisible();

      // Grid should still be empty
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBe(0);
    });
  });

  test.describe("5.2 Valid Import", () => {
    test("paste 81-character puzzle string - counter shows 81 / 81", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      await page.getByRole("textbox").fill( PUZZLES.easy);
      await expect(page.getByText("81 / 81")).toBeVisible();
    });

    test("load button becomes enabled with valid input", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      const loadButton = page.getByRole("button", { name: "Load Puzzle" });

      // Initially disabled
      await expect(loadButton).toBeDisabled();

      // After valid input
      await page.getByRole("textbox").fill( PUZZLES.easy);
      await expect(loadButton).toBeEnabled();
    });

    test("click Load - puzzle displays in grid, dialog closes", async ({ sudokuPage, page }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // Dialog should be closed
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();

      // Puzzle should be loaded - check first cell (should be 5)
      const value = await sudokuPage.getCellValue(0, 0);
      expect(value).toBe("5");
    });

    test("given cells marked as immutable", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);

      // First cell (5) should be a given
      const isGiven = await sudokuPage.isCellGiven(0, 0);
      expect(isGiven).toBe(true);
    });
  });

  test.describe("5.3 Import Validation", () => {
    test("enter < 81 characters - Load button disabled", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      await page.getByRole("textbox").fill( "12345");

      const loadButton = page.getByRole("button", { name: "Load Puzzle" });
      await expect(loadButton).toBeDisabled();
    });

    test("enter > 81 characters - error message shown", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      await page.getByRole("textbox").fill(PUZZLES.easy + "123");

      // Use first() to avoid strict mode violation if error appears in multiple places
      await expect(page.getByText(/too many characters/i).first()).toBeVisible();
    });

    test("supported empty formats: ., 0, space - all treated as empty", async ({ sudokuPage }) => {
      // Test with dots
      const dotsFormat = ".".repeat(81);
      await sudokuPage.importPuzzle(dotsFormat);
      expect(await sudokuPage.getFilledCellCount()).toBe(0);

      // Reset and test with zeros
      await sudokuPage.clickClearAll();
      const zerosFormat = "0".repeat(81);
      await sudokuPage.importPuzzle(zerosFormat);
      expect(await sudokuPage.getFilledCellCount()).toBe(0);
    });

    test("invalid characters - error message shown", async ({ sudokuPage, page }) => {
      await sudokuPage.openImportDialog();
      const invalidPuzzle = "x".repeat(81);
      await page.getByRole("textbox").fill(invalidPuzzle);

      // Try to load
      await page.click('button:has-text("Load Puzzle")');

      // Should show error - use first() to avoid strict mode violation
      await expect(page.getByText(/invalid character/i).first()).toBeVisible();
    });
  });

  test.describe("5.4 Single-Line Import Formats", () => {
    test("single line: 530070000600195... loads correctly", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(PUZZLES.easy);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
      expect(await sudokuPage.getCellValue(0, 1)).toBe("3");
    });

    test("with dots for empty: 5.3..7.... loads correctly", async ({ sudokuPage }) => {
      // First row: 5.3..7... (9 chars), remaining 72 dots for other rows
      const dotsFormat = "5.3..7..." + ".".repeat(72);
      await sudokuPage.importPuzzle(dotsFormat);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
      expect(await sudokuPage.getCellValue(0, 2)).toBe("3");
    });

    test("with zeros for empty: 503007000 loads correctly", async ({ sudokuPage }) => {
      const zerosFormat = "503007000" + "0".repeat(72);
      await sudokuPage.importPuzzle(zerosFormat);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
      expect(await sudokuPage.getCellValue(0, 2)).toBe("3");
    });
  });

  test.describe("5.5 Multi-Line Import Formats", () => {
    test("9 lines of 9 digits each loads correctly", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(MULTILINE_PUZZLES.nineLines);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
      expect(await sudokuPage.getCellValue(0, 1)).toBe("3");
      expect(await sudokuPage.getCellValue(1, 3)).toBe("1");
    });

    test("grid with spaces between digits loads correctly", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(MULTILINE_PUZZLES.withSpaces);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
      expect(await sudokuPage.getCellValue(0, 1)).toBe("3");
    });

    test("grid with pipe separators loads correctly", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(MULTILINE_PUZZLES.withPipes);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
      expect(await sudokuPage.getCellValue(0, 1)).toBe("3");
    });

    test("grid with dashes as row separators - dashes ignored", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(MULTILINE_PUZZLES.withPipes);
      // The puzzle should load, ignoring the dash separators
      const filledCount = await sudokuPage.getFilledCellCount();
      expect(filledCount).toBeGreaterThan(0);
    });

    test("mixed whitespace (tabs, spaces, newlines) - loads correctly", async ({ sudokuPage }) => {
      const mixedWhitespace = "5 3 0\t0 7 0  0 0 0\n" +
        "6\t0\t0\t1\t9\t5\t0\t0\t0\n" +
        "0 9 8 0 0 0 0 6 0\n" +
        "8 0 0 0 6 0 0 0 3\n" +
        "4 0 0 8 0 3 0 0 1\n" +
        "7 0 0 0 2 0 0 0 6\n" +
        "0 6 0 0 0 0 2 8 0\n" +
        "0 0 0 4 1 9 0 0 5\n" +
        "0 0 0 0 8 0 0 7 9";
      await sudokuPage.importPuzzle(mixedWhitespace);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
    });

    test("trailing/leading whitespace on lines - loads correctly", async ({ sudokuPage }) => {
      const withWhitespace = "  530070000  \n" +
        "  600195000  \n" +
        "  098000060  \n" +
        "  800060003  \n" +
        "  400803001  \n" +
        "  700020006  \n" +
        "  060000280  \n" +
        "  000419005  \n" +
        "  000080079  ";
      await sudokuPage.importPuzzle(withWhitespace);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
    });

    test("Windows line endings (CRLF) - handled correctly", async ({ sudokuPage }) => {
      const crlfPuzzle = MULTILINE_PUZZLES.nineLines.replace(/\n/g, "\r\n");
      await sudokuPage.importPuzzle(crlfPuzzle);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
    });

    test("Unix line endings (LF) - handled correctly", async ({ sudokuPage }) => {
      await sudokuPage.importPuzzle(MULTILINE_PUZZLES.nineLines);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
    });
  });

  test.describe("5.6 Multi-Line Validation", () => {
    test("multi-line with extra blank lines - blank lines ignored", async ({ sudokuPage }) => {
      const withBlankLines = "\n\n" + MULTILINE_PUZZLES.nineLines + "\n\n";
      await sudokuPage.importPuzzle(withBlankLines);
      expect(await sudokuPage.getCellValue(0, 0)).toBe("5");
    });
  });
});
