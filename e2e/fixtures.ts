import { test as base, expect } from "@playwright/test";

/**
 * Test fixtures and helpers for Sudoku E2E tests
 */

// Sample puzzles for testing
export const PUZZLES = {
  easy: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
  hard: "000000000000003085001020000000507000004000100090000000500000073002010000000040009",
  invalid: "110000000000000000000000000000000000000000000000000000000000000000000000000000000",
  empty: "000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  // Partial puzzle for testing (some cells filled)
  partial: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
};

// Multi-line format puzzles
export const MULTILINE_PUZZLES = {
  nineLines: `530070000
600195000
098000060
800060003
400803001
700020006
060000280
000419005
000080079`,
  withSpaces: `5 3 0 0 7 0 0 0 0
6 0 0 1 9 5 0 0 0
0 9 8 0 0 0 0 6 0
8 0 0 0 6 0 0 0 3
4 0 0 8 0 3 0 0 1
7 0 0 0 2 0 0 0 6
0 6 0 0 0 0 2 8 0
0 0 0 4 1 9 0 0 5
0 0 0 0 8 0 0 7 9`,
  withPipes: `5 3 0 | 0 7 0 | 0 0 0
6 0 0 | 1 9 5 | 0 0 0
0 9 8 | 0 0 0 | 0 6 0
------+-------+------
8 0 0 | 0 6 0 | 0 0 3
4 0 0 | 8 0 3 | 0 0 1
7 0 0 | 0 2 0 | 0 0 6
------+-------+------
0 6 0 | 0 0 0 | 2 8 0
0 0 0 | 4 1 9 | 0 0 5
0 0 0 | 0 8 0 | 0 7 9`,
};

// Extended test fixture with helper methods
export const test = base.extend<{
  sudokuPage: SudokuPage;
}>({
  sudokuPage: async ({ page }, use) => {
    const sudokuPage = new SudokuPage(page);
    // Clear localStorage before each test for clean state
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="sudoku-grid"]', { timeout: 15000 });
    await use(sudokuPage);
  },
});

export { expect };

/**
 * Page object for Sudoku app interactions
 */
export class SudokuPage {
  constructor(private page: import("@playwright/test").Page) {}

  async goto() {
    await this.page.goto("/");
    await this.page.waitForSelector('[data-testid="sudoku-grid"]', { timeout: 10000 });
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Cell interactions
  async clickCell(row: number, col: number) {
    await this.page.click(`[data-cell="r${row}c${col}"]`);
  }

  async getCellValue(row: number, col: number): Promise<string> {
    const cell = this.page.locator(`[data-cell="r${row}c${col}"]`);
    // The value span uses CSS module class like _value_xxxxx, so match with selector that contains "value"
    const valueSpan = cell.locator('span[class*="value"]');
    const count = await valueSpan.count();
    if (count === 0) return "";
    const value = await valueSpan.textContent();
    return value?.trim() || "";
  }

  async isCellSelected(row: number, col: number): Promise<boolean> {
    const cell = this.page.locator(`[data-cell="r${row}c${col}"]`);
    // CSS modules mangle class names, so check for class containing "selected"
    return cell.evaluate((el) =>
      Array.from(el.classList).some(c => c.includes("selected"))
    );
  }

  async isCellGiven(row: number, col: number): Promise<boolean> {
    const cell = this.page.locator(`[data-cell="r${row}c${col}"]`);
    return cell.evaluate((el) =>
      Array.from(el.classList).some(c => c.includes("given"))
    );
  }

  async isCellConflict(row: number, col: number): Promise<boolean> {
    const cell = this.page.locator(`[data-cell="r${row}c${col}"]`);
    return cell.evaluate((el) =>
      Array.from(el.classList).some(c => c.includes("conflict"))
    );
  }

  // Keyboard input
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async typeNumber(num: number) {
    await this.page.keyboard.press(num.toString());
  }

  // Navigation
  async navigateUp() {
    await this.pressKey("ArrowUp");
  }

  async navigateDown() {
    await this.pressKey("ArrowDown");
  }

  async navigateLeft() {
    await this.pressKey("ArrowLeft");
  }

  async navigateRight() {
    await this.pressKey("ArrowRight");
  }

  // Number palette
  async clickPaletteNumber(num: number) {
    await this.page.click(`[data-testid="palette-${num}"]`);
  }

  async dragNumberToCell(num: number, row: number, col: number) {
    const source = this.page.locator(`[data-testid="palette-${num}"]`);
    const target = this.page.locator(`[data-cell="r${row}c${col}"]`);
    await source.dragTo(target);
  }

  // Input mode
  async setInputMode(mode: "value" | "pencil") {
    await this.page.click(`[data-testid="${mode}-mode-toggle"]`);
  }

  async togglePencilMode() {
    // Toggle between value and pencil mode
    const isPencil = await this.isPencilModeActive();
    await this.setInputMode(isPencil ? "value" : "pencil");
  }

  async isPencilModeActive(): Promise<boolean> {
    // Check if pencil button has aria-selected="true" (ToggleButtonGroup behavior)
    const toggle = this.page.locator('[data-testid="pencil-mode-toggle"]');
    const isSelected = await toggle.evaluate((el) =>
      el.getAttribute("aria-pressed") === "true" || el.classList.contains("Mui-selected")
    );
    return isSelected;
  }

  // Import puzzle
  async openImportDialog() {
    await this.page.click('[data-testid="import-puzzle-btn"]');
    await this.page.waitForSelector('[role="dialog"]');
  }

  async importPuzzle(puzzle: string) {
    await this.openImportDialog();
    // MUI multiline TextField creates 2 textareas, use the visible one via role
    await this.page.getByRole("textbox").fill(puzzle);
    await this.page.click('button:has-text("Load Puzzle")');
    await this.page.waitForSelector('[role="dialog"]', { state: "hidden" });
  }

  async closeImportDialog() {
    await this.page.click('button:has-text("Cancel")');
  }

  // Random puzzle generation
  async selectDifficulty(difficulty: "Easy" | "Medium" | "Hard" | "Expert") {
    await this.page.click('[data-testid="difficulty-select"]');
    await this.page.click(`[data-value="${difficulty.toLowerCase()}"]`);
  }

  async generatePuzzle() {
    await this.page.click('[data-testid="generate-btn"]');
  }

  // Undo/Redo
  async clickUndo() {
    await this.page.click('[data-testid="undo-btn"]');
  }

  async clickRedo() {
    await this.page.click('[data-testid="redo-btn"]');
  }

  async isUndoDisabled(): Promise<boolean> {
    return this.page.locator('[data-testid="undo-btn"]').isDisabled();
  }

  async isRedoDisabled(): Promise<boolean> {
    return this.page.locator('[data-testid="redo-btn"]').isDisabled();
  }

  // Solver controls
  async clickSolve() {
    await this.page.click('[data-testid="solve-btn"]');
  }

  async clickFindAll() {
    await this.page.click('[data-testid="find-all-btn"]');
  }

  async clickAutoFill() {
    await this.page.click('[data-testid="auto-fill-btn"]');
  }

  async clickReset() {
    await this.page.click('[data-testid="reset-btn"]');
  }

  async clickClearAll() {
    await this.page.click('[data-testid="clear-all-btn"]');
  }

  // Solution navigation
  async clickNextSolution() {
    await this.page.click('[data-testid="next-solution-btn"]');
  }

  async clickPrevSolution() {
    await this.page.click('[data-testid="prev-solution-btn"]');
  }

  // Hints
  async toggleHints() {
    await this.page.click('[data-testid="hints-toggle"]');
  }

  async setHintsMode(mode: "selected" | "all" | "none") {
    await this.page.click(`[data-testid="hints-mode-${mode}"]`);
  }

  // Theme
  async toggleTheme() {
    await this.page.click('[data-testid="theme-toggle"]');
  }

  async getThemeMode(): Promise<string> {
    // Returns the effective theme mode (light or dark) from data-theme attribute
    return this.page.evaluate(() => {
      return document.documentElement.getAttribute("data-theme") || "light";
    });
  }

  async getStoredThemeMode(): Promise<string> {
    // Returns the stored theme mode (light or dark) from localStorage
    return this.page.evaluate(() => {
      try {
        const stored = localStorage.getItem("sudoku-theme");
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.state?.mode || "light";
        }
      } catch {
        // Ignore parse errors
      }
      return "light";
    });
  }

  async setThemeMode(mode: "light" | "dark") {
    // Toggle until we reach desired mode
    // Default is "light", toggle cycle: light -> dark -> light
    let currentMode = await this.getThemeMode();
    let toggles = 0;
    const maxToggles = 2;

    while (currentMode !== mode && toggles < maxToggles) {
      await this.toggleTheme();
      // Wait for theme transition
      await this.page.waitForTimeout(100);
      currentMode = await this.getThemeMode();
      toggles++;
    }
  }

  // Utility methods
  async getGridCellCount(): Promise<number> {
    return this.page.locator('[data-cell]').count();
  }

  async getFilledCellCount(): Promise<number> {
    const cells = this.page.locator('[data-cell]');
    const count = await cells.count();
    let filled = 0;
    for (let i = 0; i < count; i++) {
      // CSS module class like _value_xxxxx
      const valueSpan = cells.nth(i).locator('span[class*="value"]');
      const spanCount = await valueSpan.count();
      if (spanCount > 0) {
        const value = await valueSpan.textContent();
        if (value?.trim()) filled++;
      }
    }
    return filled;
  }

  async waitForAlert(text: string) {
    await this.page.waitForSelector(`text=${text}`, { timeout: 10000 });
  }

  async dismissAlert() {
    const closeButton = this.page.locator('[data-testid="alert-close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
}
