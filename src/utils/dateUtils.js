/**
 * Date utility functions for the FooGood app
 */

/**
 * Calculate days between two dates
 * @param {Date} a - Start date
 * @param {Date} b - End date
 * @returns {number} Number of days between dates
 */
export function daysBetween(a, b) {
  const ms = new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const dt = new Date(date);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse date to ISO format or return empty string if invalid
 * @param {Date} date - Date to parse
 * @returns {string} ISO formatted date or empty string
 */
export function parseISOorEmpty(date) {
  const dt = new Date(date);
  return isNaN(dt.getTime()) ? "" : formatDate(dt);
}

/**
 * Calculate days until expiry from today
 * @param {string} expiryDate - ISO date string
 * @returns {number} Days until expiry (negative if expired)
 */
export function daysUntilExpiry(expiryDate) {
  return daysBetween(new Date(), new Date(expiryDate));
}