/**
 * Security utilities for input sanitization, PDF verification, and CSV formula defense.
 */

/**
 * Escapes HTML characters to prevent Reflected and Stored XSS.
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that an external URL is a safe HTTPS URL (blocks javascript:, data:, file:, etc.)
 */
export function isSafeHttpsUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidPdfBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 5) return false;
  // Check the first 1024 bytes for %PDF- magic bytes
  // Valid PDF files start with "%PDF-" (hex: 25 50 44 46 2D), allowing optional UTF-8 BOM or leading whitespace
  const header = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
  const cleanHeader = header.replace(/^\uFEFF/, '').trimStart();
  return cleanHeader.startsWith('%PDF-');
}

/**
 * Sanitizes a value for safe CSV export, neutralizing Excel/Calc Formula Injection (CWE-1236).
 * Prepends a single quote if the value starts with dangerous calculation triggers (=, +, -, @, tab, cr).
 */
export function sanitizeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // If the cell begins with formula execution characters, neutralize with leading single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  // Escape double quotes per RFC 4180
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}
