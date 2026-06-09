import sharp from 'sharp';

/**
 * Add a semi-transparent text watermark overlay to an image.
 * The watermark is placed at the bottom-right corner.
 *
 * @param {Buffer} imageBuffer - The source image as a Buffer.
 * @param {Object} options - Watermark configuration.
 * @param {string} [options.clubName='Mogger Manages'] - Club/organization name.
 * @param {string} [options.eventName=''] - Optional event name to include.
 * @param {string} [options.userRole='viewer'] - User role (affects watermark styling).
 * @returns {Promise<Buffer>} The watermarked image buffer.
 */
export async function addWatermark(
  imageBuffer,
  { clubName = 'Mogger Manages', eventName = '', userRole = 'viewer' } = {}
) {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Scale font size relative to image dimensions
    const fontSize = Math.max(Math.floor(width * 0.025), 14);
    const padding = Math.floor(fontSize * 1.5);

    // Build watermark text lines
    const lines = [clubName];
    if (eventName) {
      lines.push(eventName);
    }

    // Determine opacity based on user role
    // Admins/photographers get a lighter watermark
    const opacity =
      userRole === 'admin' || userRole === 'photographer' ? 0.3 : 0.5;

    // Create SVG text overlay
    const textElements = lines
      .map((line, index) => {
        const y = height - padding - (lines.length - 1 - index) * (fontSize + 4);
        return `<text
          x="${width - padding}"
          y="${y}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="white"
          fill-opacity="${opacity}"
          text-anchor="end"
          filter="url(#shadow)"
        >${escapeXml(line)}</text>`;
      })
      .join('\n');

    const svgOverlay = Buffer.from(`
      <svg width="${width}" height="${height}">
        <defs>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="black" flood-opacity="0.6"/>
          </filter>
        </defs>
        ${textElements}
      </svg>
    `);

    const watermarkedBuffer = await image
      .composite([
        {
          input: svgOverlay,
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();

    return watermarkedBuffer;
  } catch (error) {
    console.error('❌ Watermark error:', error.message);
    // Return original buffer if watermarking fails
    return imageBuffer;
  }
}

/**
 * Escape special XML characters in a string.
 * @param {string} str - The string to escape.
 * @returns {string} XML-safe string.
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
