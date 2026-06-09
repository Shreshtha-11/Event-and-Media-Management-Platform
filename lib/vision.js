import { ImageAnnotatorClient } from '@google-cloud/vision';

let visionClient = null;

/**
 * Lazily initialize the Vision API client.
 * Returns null if Vision API is disabled via env var.
 */
function getVisionClient() {
  if (!process.env.VISION_API_ENABLED || process.env.VISION_API_ENABLED !== 'true') {
    return null;
  }

  if (!visionClient) {
    try {
      visionClient = new ImageAnnotatorClient({
        projectId: process.env.GCS_PROJECT_ID,
        keyFilename: process.env.GCS_KEY_FILE,
      });
    } catch (error) {
      console.error('❌ Failed to initialize Vision API client:', error.message);
      return null;
    }
  }

  return visionClient;
}

/**
 * Analyze an image and return detected labels/tags.
 * @param {Buffer} imageBuffer - The image as a Buffer.
 * @returns {Promise<Array<{name: string, score: number}>>} Array of label objects.
 */
export async function analyzeImage(imageBuffer) {
  const client = getVisionClient();
  if (!client) {
    return [];
  }

  try {
    const [result] = await client.labelDetection({
      image: { content: imageBuffer.toString('base64') },
    });

    const labels = result.labelAnnotations || [];

    return labels.map((label) => ({
      name: label.description,
      score: parseFloat(label.score.toFixed(3)),
    }));
  } catch (error) {
    console.error('❌ Vision API label detection error:', error.message);
    return [];
  }
}

/**
 * Detect faces in an image and return face annotation data.
 * @param {Buffer} imageBuffer - The image as a Buffer.
 * @returns {Promise<Array<Object>>} Array of face detection results.
 */
export async function detectFaces(imageBuffer) {
  const client = getVisionClient();
  if (!client) {
    return [];
  }

  try {
    const [result] = await client.faceDetection({
      image: { content: imageBuffer.toString('base64') },
    });

    const faces = result.faceAnnotations || [];

    return faces.map((face, index) => ({
      index,
      confidence: parseFloat(face.detectionConfidence.toFixed(3)),
      joy: face.joyLikelihood,
      sorrow: face.sorrowLikelihood,
      anger: face.angerLikelihood,
      surprise: face.surpriseLikelihood,
      boundingPoly: face.boundingPoly?.vertices || [],
    }));
  } catch (error) {
    console.error('❌ Vision API face detection error:', error.message);
    return [];
  }
}

/**
 * Run content moderation (SafeSearch) on an image.
 * @param {Buffer} imageBuffer - The image as a Buffer.
 * @returns {Promise<Object>} Safety annotations with likelihood ratings.
 */
export async function moderateContent(imageBuffer) {
  const client = getVisionClient();
  if (!client) {
    return {
      safe: true,
      adult: 'UNKNOWN',
      violence: 'UNKNOWN',
      racy: 'UNKNOWN',
      medical: 'UNKNOWN',
      spoof: 'UNKNOWN',
    };
  }

  try {
    const [result] = await client.safeSearchDetection({
      image: { content: imageBuffer.toString('base64') },
    });

    const safeSearch = result.safeSearchAnnotation || {};

    const HIGH_RISK = ['LIKELY', 'VERY_LIKELY'];

    const isSafe =
      !HIGH_RISK.includes(safeSearch.adult) &&
      !HIGH_RISK.includes(safeSearch.violence);

    return {
      safe: isSafe,
      adult: safeSearch.adult || 'UNKNOWN',
      violence: safeSearch.violence || 'UNKNOWN',
      racy: safeSearch.racy || 'UNKNOWN',
      medical: safeSearch.medical || 'UNKNOWN',
      spoof: safeSearch.spoof || 'UNKNOWN',
    };
  } catch (error) {
    console.error('❌ Vision API moderation error:', error.message);
    return {
      safe: true,
      adult: 'UNKNOWN',
      violence: 'UNKNOWN',
      racy: 'UNKNOWN',
      medical: 'UNKNOWN',
      spoof: 'UNKNOWN',
    };
  }
}
