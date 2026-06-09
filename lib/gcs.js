import { Storage } from '@google-cloud/storage';

let storage = null;
let bucket = null;

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const GCS_PROJECT_ID = process.env.GCS_PROJECT_ID;
const GCS_KEY_FILE = process.env.GCS_KEY_FILE;

/**
 * Lazily initialize the GCS client and bucket.
 * Returns null if GCS is not configured.
 */
function getGCSBucket() {
  if (bucket) return bucket;

  if (!GCS_BUCKET_NAME || !GCS_PROJECT_ID || !GCS_KEY_FILE) {
    console.warn('⚠️ GCS is not configured. File operations will be skipped.');
    return null;
  }

  try {
    storage = new Storage({
      projectId: GCS_PROJECT_ID,
      keyFilename: GCS_KEY_FILE,
    });
    bucket = storage.bucket(GCS_BUCKET_NAME);
    return bucket;
  } catch (error) {
    console.error('❌ Failed to initialize GCS:', error.message);
    return null;
  }
}

/**
 * Upload a file buffer to Google Cloud Storage.
 * @param {Buffer} buffer - The file content as a Buffer.
 * @param {string} filename - The destination filename/path in the bucket.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
export async function uploadFile(buffer, filename, mimetype) {
  const gcsBucket = getGCSBucket();
  if (!gcsBucket) {
    throw new Error('GCS is not configured. Cannot upload file.');
  }

  try {
    const file = gcsBucket.file(filename);

    await file.save(buffer, {
      metadata: {
        contentType: mimetype,
      },
      resumable: false,
    });

    // Make the file publicly accessible
    await file.makePublic();

    return getPublicUrl(filename);
  } catch (error) {
    console.error('❌ GCS upload error:', error.message);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete a file from Google Cloud Storage.
 * @param {string} filename - The filename/path in the bucket to delete.
 * @returns {Promise<boolean>} True if deleted successfully.
 */
export async function deleteFile(filename) {
  const gcsBucket = getGCSBucket();
  if (!gcsBucket) {
    console.warn('GCS not configured. Skipping file deletion.');
    return false;
  }

  try {
    await gcsBucket.file(filename).delete();
    return true;
  } catch (error) {
    if (error.code === 404) {
      console.warn(`File not found in GCS: ${filename}`);
      return false;
    }
    console.error('❌ GCS delete error:', error.message);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Generate a signed URL for temporary access to a file.
 * @param {string} filename - The filename/path in the bucket.
 * @param {number} [expiresInMinutes=60] - URL expiration time in minutes.
 * @returns {Promise<string>} A signed URL string.
 */
export async function getSignedUrl(filename, expiresInMinutes = 60) {
  const gcsBucket = getGCSBucket();
  if (!gcsBucket) {
    throw new Error('GCS is not configured. Cannot generate signed URL.');
  }

  try {
    const [url] = await gcsBucket.file(filename).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return url;
  } catch (error) {
    console.error('❌ GCS signed URL error:', error.message);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Get the public URL for a file in the bucket.
 * @param {string} filename - The filename/path in the bucket.
 * @returns {string} The public URL.
 */
export function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${filename}`;
}
