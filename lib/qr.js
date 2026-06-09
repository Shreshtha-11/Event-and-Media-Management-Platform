import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL (base64-encoded PNG).
 * Suitable for embedding directly in HTML img tags.
 *
 * @param {string} url - The URL or text to encode.
 * @returns {Promise<string>} Data URL string (e.g., "data:image/png;base64,...").
 */
export async function generateQRCode(url) {
  if (!url) {
    throw new Error('URL is required to generate a QR code');
  }

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (error) {
    console.error('❌ QR code generation error:', error.message);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Generate a QR code as a PNG Buffer.
 * Suitable for saving to files or uploading to storage.
 *
 * @param {string} url - The URL or text to encode.
 * @returns {Promise<Buffer>} PNG image buffer.
 */
export async function generateQRBuffer(url) {
  if (!url) {
    throw new Error('URL is required to generate a QR code buffer');
  }

  try {
    const buffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return buffer;
  } catch (error) {
    console.error('❌ QR buffer generation error:', error.message);
    throw new Error(`Failed to generate QR buffer: ${error.message}`);
  }
}
