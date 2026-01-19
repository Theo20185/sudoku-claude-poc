/**
 * Input Validator
 *
 * Validates and sanitizes all user input to prevent
 * XSS attacks and ensure data integrity.
 */

import type { GridSize, CellValue, ValidationResult } from "../models/types";
import { getSymbolSet, isValidGridSize } from "../utils/gridHelpers";

export class InputValidator {
  /**
   * Validate and parse text input for puzzle loading.
   * Accepts formats like:
   * - "123456789..." (81 chars for 9x9)
   * - ".2.4....." (dots for empty)
   * - "0 2 0 4..." (spaces between, 0 for empty)
   */
  static parseTextInput(
    input: string,
    expectedSize: GridSize
  ): ValidationResult {
    // Sanitize input - remove potentially dangerous characters
    const sanitized = this.sanitizeString(input);

    // Remove whitespace, formatting characters (|, -, +, :), and normalize
    // These characters are often used in visual grid representations
    const cleaned = sanitized.replace(/[\s|+\-:]+/g, "").toUpperCase();

    const expectedLength = expectedSize * expectedSize;

    // Check length
    if (cleaned.length !== expectedLength) {
      return {
        valid: false,
        error: `Expected ${expectedLength} characters, got ${cleaned.length}`,
      };
    }

    // Parse characters
    const values: CellValue[] = [];
    const validChars = this.getValidCharacters(expectedSize);

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (char === "." || char === "0") {
        values.push(null);
      } else if (validChars.includes(char)) {
        const value = this.charToValue(char, expectedSize);
        if (value !== null) {
          values.push(value);
        } else {
          return {
            valid: false,
            error: `Invalid character '${char}' at position ${i + 1}`,
          };
        }
      } else {
        return {
          valid: false,
          error: `Invalid character '${char}' at position ${i + 1}`,
        };
      }
    }

    return { valid: true, values };
  }

  /**
   * Validate a single cell value input.
   */
  static validateCellValue(
    value: unknown,
    gridSize: GridSize
  ): { valid: boolean; sanitized: CellValue; error?: string } {
    // Handle null/undefined/empty
    if (value === null || value === undefined || value === "") {
      return { valid: true, sanitized: null };
    }

    // Handle string input
    if (typeof value === "string") {
      const sanitized = this.sanitizeString(value).trim().toUpperCase();

      // Empty string
      if (sanitized === "" || sanitized === "." || sanitized === "0") {
        return { valid: true, sanitized: null };
      }

      // Try numeric parse
      const num = parseInt(sanitized, 10);
      if (!isNaN(num)) {
        if (num >= 1 && num <= gridSize) {
          return { valid: true, sanitized: num };
        }
        return {
          valid: false,
          sanitized: null,
          error: `Value must be between 1 and ${gridSize}`,
        };
      }

      return {
        valid: false,
        sanitized: null,
        error: `Invalid value: ${sanitized}`,
      };
    }

    // Handle number input
    if (typeof value === "number") {
      if (isNaN(value) || !Number.isInteger(value)) {
        return {
          valid: false,
          sanitized: null,
          error: "Value must be an integer",
        };
      }

      if (value < 1 || value > gridSize) {
        return {
          valid: false,
          sanitized: null,
          error: `Value must be between 1 and ${gridSize}`,
        };
      }

      return { valid: true, sanitized: value };
    }

    return {
      valid: false,
      sanitized: null,
      error: "Invalid input type",
    };
  }

  /**
   * Validate grid size input.
   */
  static validateGridSize(
    value: unknown
  ): { valid: boolean; sanitized: GridSize | null; error?: string } {
    if (value === null || value === undefined) {
      return {
        valid: false,
        sanitized: null,
        error: "Grid size is required",
      };
    }

    let size: number;

    if (typeof value === "string") {
      const sanitized = this.sanitizeString(value).trim();
      size = parseInt(sanitized, 10);
    } else if (typeof value === "number") {
      size = value;
    } else {
      return {
        valid: false,
        sanitized: null,
        error: "Invalid grid size type",
      };
    }

    if (isNaN(size) || !Number.isInteger(size)) {
      return {
        valid: false,
        sanitized: null,
        error: "Grid size must be an integer",
      };
    }

    if (!isValidGridSize(size)) {
      return {
        valid: false,
        sanitized: null,
        error: "Grid size must be 9",
      };
    }

    return { valid: true, sanitized: size as GridSize };
  }

  /**
   * Sanitize a string to prevent XSS and other injection attacks.
   */
  static sanitizeString(input: string): string {
    if (typeof input !== "string") {
      return "";
    }

    // Remove null bytes
    let sanitized = input.replace(/\0/g, "");

    // Remove control characters (except newline, tab)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Encode HTML entities to prevent XSS
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    // Limit length to prevent DoS
    const MAX_LENGTH = 10000;
    if (sanitized.length > MAX_LENGTH) {
      sanitized = sanitized.substring(0, MAX_LENGTH);
    }

    return sanitized;
  }

  /**
   * Validate and sanitize a coordinate.
   */
  static validateCoordinate(
    row: unknown,
    col: unknown,
    gridSize: GridSize
  ): { valid: boolean; row: number; col: number; error?: string } {
    const rowNum = typeof row === "number" ? row : parseInt(String(row), 10);
    const colNum = typeof col === "number" ? col : parseInt(String(col), 10);

    if (isNaN(rowNum) || isNaN(colNum)) {
      return {
        valid: false,
        row: 0,
        col: 0,
        error: "Invalid coordinate format",
      };
    }

    if (
      !Number.isInteger(rowNum) ||
      !Number.isInteger(colNum) ||
      rowNum < 0 ||
      rowNum >= gridSize ||
      colNum < 0 ||
      colNum >= gridSize
    ) {
      return {
        valid: false,
        row: 0,
        col: 0,
        error: `Coordinates must be between 0 and ${gridSize - 1}`,
      };
    }

    return { valid: true, row: rowNum, col: colNum };
  }

  /**
   * Get valid characters for the grid (1-9 for standard Sudoku).
   */
  private static getValidCharacters(_size: GridSize): string[] {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  }

  /**
   * Convert a character to its numeric value (1-9 for standard Sudoku).
   */
  private static charToValue(char: string, _size: GridSize): number | null {
    const code = char.charCodeAt(0);

    // '1' to '9'
    if (code >= 49 && code <= 57) {
      return code - 48;
    }

    return null;
  }

  /**
   * Validate file upload for background images.
   */
  static validateImageFile(file: File): {
    valid: boolean;
    error?: string;
  } {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG",
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File too large. Maximum size is 5MB",
      };
    }

    // Check file name for suspicious patterns
    const fileName = file.name.toLowerCase();
    const suspiciousPatterns = [
      ".php",
      ".js",
      ".html",
      ".htm",
      ".exe",
      ".bat",
      ".cmd",
      ".sh",
    ];
    if (suspiciousPatterns.some((p) => fileName.includes(p))) {
      return {
        valid: false,
        error: "Invalid file name",
      };
    }

    return { valid: true };
  }

  /**
   * Validate color input.
   */
  static validateColor(color: string): {
    valid: boolean;
    sanitized: string;
    error?: string;
  } {
    const sanitized = this.sanitizeString(color).trim();

    // Hex color
    if (/^#[0-9A-Fa-f]{3}$/.test(sanitized) || /^#[0-9A-Fa-f]{6}$/.test(sanitized)) {
      return { valid: true, sanitized };
    }

    // RGB/RGBA
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(sanitized)) {
      return { valid: true, sanitized };
    }

    // HSL/HSLA
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/.test(sanitized)) {
      return { valid: true, sanitized };
    }

    // Named colors (basic set)
    const namedColors = [
      "black", "white", "red", "green", "blue", "yellow", "cyan", "magenta",
      "gray", "grey", "orange", "purple", "pink", "brown", "navy", "teal",
      "olive", "maroon", "lime", "aqua", "fuchsia", "silver",
    ];
    if (namedColors.includes(sanitized.toLowerCase())) {
      return { valid: true, sanitized: sanitized.toLowerCase() };
    }

    return {
      valid: false,
      sanitized: "",
      error: "Invalid color format",
    };
  }
}
