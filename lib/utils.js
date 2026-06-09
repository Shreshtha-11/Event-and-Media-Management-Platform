/**
 * Format a date into a human-readable string.
 * @param {Date|string} date - The date to format.
 * @returns {string} Formatted date string (e.g., "Jun 9, 2026").
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format bytes into a human-readable file size string.
 * @param {number} bytes - The file size in bytes.
 * @returns {string} Formatted size string (e.g., "1.5 MB").
 */
export function formatFileSize(bytes) {
  if (bytes === 0 || !bytes) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${size} ${units[i]}`;
}

/**
 * Generate a URL-safe slug from text.
 * @param {string} text - The text to slugify.
 * @returns {string} A lowercase, hyphenated slug.
 */
export function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars (except hyphens)
    .replace(/\-\-+/g, '-')     // Replace multiple hyphens with single
    .replace(/^-+/, '')          // Trim leading hyphens
    .replace(/-+$/, '');         // Trim trailing hyphens
}

/**
 * Truncate text to a specified length with ellipsis.
 * @param {string} text - The text to truncate.
 * @param {number} [maxLength=100] - Maximum character length.
 * @returns {string} Truncated text with "..." appended if needed.
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} Up to 2 uppercase initials (e.g., "JD" for "John Doe").
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validate an email address format.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if the email format is valid.
 */
export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create a debounced version of a function.
 * @param {Function} fn - The function to debounce.
 * @param {number} [delay=300] - Delay in milliseconds.
 * @returns {Function} Debounced function.
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Generate a random hex color string.
 * @returns {string} A hex color code (e.g., "#A3F2C1").
 */
export function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
