const axios = require("axios");

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "[Gemini] Missing GEMINI_API_KEY. Using fallback image passthrough instead."
  );
}

function buildFallbackResult(baseImageData, baseImageMime, referenceImageData) {
  const data = baseImageData || referenceImageData;
  if (!data) {
    throw new Error("Fallback requires at least one image source");
  }
  return {
    mimeType: baseImageMime,
    data,
    isFallback: true,
  };
}

/**
 * Call Gemini vision model to recolor/retouch a house photo using a reference sample.
 * @param {Object} opts
 * @param {string} opts.baseImageData - Base64 (no prefix) of the original house photo.
 * @param {string} opts.referenceImageData - Base64 (no prefix) of the sample/reference image.
 * @param {string} [opts.prompt] - Extra natural-language instructions.
 * @param {string} [opts.baseImageMime] - Mime type for the base image (default image/jpeg).
 * @param {string} [opts.referenceImageMime] - Mime type for the sample image.
 * @returns {Promise<{mimeType: string, data: string}>}
 */
async function generateHouseDesign({
  baseImageData,
  referenceImageData,
  prompt,
  baseImageMime = "image/jpeg",
  referenceImageMime = "image/jpeg",
}) {
  if (!baseImageData && !referenceImageData) {
    throw new Error("At least one image source is required");
  }
  if (!GEMINI_API_KEY) {
    return buildFallbackResult(baseImageData, baseImageMime, referenceImageData);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const instruction =
    prompt ||
    "Apply the design cues from the reference image to the house photo. Recolor the facade, windows, and details to match the reference style while keeping the structure.";

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: instruction },
          { inline_data: { mime_type: baseImageMime, data: baseImageData } },
          {
            inline_data: {
              mime_type: referenceImageMime,
              data: referenceImageData,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
    },
  };

  try {
    const response = await axios.post(endpoint, body, {
      timeout: 120000,
    });

    const parts =
      response.data?.candidates?.[0]?.content?.parts ||
      response.data?.candidates?.[0]?.content ||
      [];

    const imagePart = parts.find(
      (p) => p.inline_data && p.inline_data.data && p.inline_data.mime_type
    );

    if (!imagePart) {
      const textPart = parts.find((p) => p.text);
      const debug =
        textPart?.text || JSON.stringify(response.data, null, 2).slice(0, 2000);
      throw new Error(
        `Gemini did not return an image. Debug response: ${debug}`
      );
    }

    return {
      mimeType: imagePart.inline_data.mime_type,
      data: imagePart.inline_data.data,
    };
  } catch (err) {
    const status = err.response?.status;
    const details =
      err.response?.data?.error?.message ||
      err.response?.data ||
      err.message ||
      err.toString();

    console.warn(
      `[Gemini] Request failed${status ? ` (${status})` : ""}: ${details}. Using fallback image.`
    );
    return buildFallbackResult(baseImageData, baseImageMime, referenceImageData);
  }
}

module.exports = { generateHouseDesign };
