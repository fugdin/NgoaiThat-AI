// External AI Services - Thay thế AWS Bedrock
const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

let googleGenAiClient = null;

const DEFAULT_IMAGE_ANALYSIS_MODELS = [
  // Free-tier friendly models (ưu tiên gọi trước)
  'gemini-2.5-flash-image',
  'gemini-1.5-flash',
  
  // Các model khác vẫn có thể miễn phí tùy quota, xếp sau
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

function buildModelList() {
  const envList = [];

  // Comma separated list to allow full control
  if (process.env.GEMINI_IMAGE_ANALYSIS_MODELS) {
    envList.push(
      ...process.env.GEMINI_IMAGE_ANALYSIS_MODELS
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    );
  }

  envList.push(
    process.env.GEMINI_IMAGE_ANALYSIS_MODEL,
    process.env.GOOGLE_IMAGE_ANALYSIS_MODEL,
    process.env.GOOGLE_GEMINI_MODEL
  );

  return Array.from(new Set([...envList.filter(Boolean), ...DEFAULT_IMAGE_ANALYSIS_MODELS]));
}

const GOOGLE_IMAGE_ANALYSIS_MODELS = buildModelList();

const RETRYABLE_GOOGLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function getGoogleGenAiClient() {
  if (googleGenAiClient) return googleGenAiClient;

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY1;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY hoặc GOOGLE_API_KEY1 chưa được cấu hình trong .env');
  }

  const options = { apiKey };
  const apiVersion =
    process.env.GOOGLE_GENAI_API_VERSION ||
    process.env.GOOGLE_AI_API_VERSION ||
    process.env.GOOGLE_GENAI_DEFAULT_API_VERSION ||
    'v1';
  if (apiVersion) {
    options.apiVersion = apiVersion;
  }

  if (process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true') {
    if (!process.env.GOOGLE_CLOUD_PROJECT || !process.env.GOOGLE_CLOUD_LOCATION) {
      throw new Error('Thiếu GOOGLE_CLOUD_PROJECT hoặc GOOGLE_CLOUD_LOCATION để dùng Vertex AI');
    }
    options.vertexai = true;
    options.project = process.env.GOOGLE_CLOUD_PROJECT;
    options.location = process.env.GOOGLE_CLOUD_LOCATION;
  }

  googleGenAiClient = new GoogleGenAI(options);
  return googleGenAiClient;
}

function extractGeminiText(response) {
  if (!response) return '';

  // New SDK exposes .text as a getter, but handle both getter + method signatures
  if (typeof response.text === 'function') {
    const textValue = response.text();
    if (textValue) return textValue.trim();
  } else if (typeof response.text === 'string') {
    return response.text.trim();
  }

  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    const text = parts
      .map((part) => part?.text || '')
      .filter(Boolean)
      .join('\n')
      .trim();
    if (text) return text;
  }

  return '';
}

function isRetryableGoogleError(error) {
  const status = Number(error?.status || error?.code || error?.response?.status);
  if (Number.isFinite(status) && RETRYABLE_GOOGLE_STATUS.has(status)) {
    return true;
  }

  const message = (error?.message || '').toLowerCase();
  return (
    message.includes('overloaded') ||
    message.includes('unavailable') ||
    message.includes('exceeded') ||
    message.includes('timed out') ||
    message.includes('deadline') ||
    message.includes('try again')
  );
}

function isModelUnavailableError(error) {
  const status = Number(error?.status || error?.code || error?.response?.status);
  if (status === 404) return true;
  const message = (error?.message || '').toLowerCase();
  return (
    message.includes('not found') ||
    message.includes('unsupported') ||
    message.includes('listmodels')
  );
}

/**
 * Phân tích ảnh bằng Google Gemini (nếu có API key)
 * @param {Buffer} imageBuffer - Buffer của ảnh cần phân tích
 * @param {string} mimeType - MIME type của ảnh
 * @param {string} prompt - Prompt yêu cầu phân tích
 * @returns {Promise<string>} - Kết quả phân tích dạng text
 */
async function analyzeImageWithGemini(imageBuffer, mimeType, prompt) {
  // Sử dụng GoogleGenerativeAI trực tiếp thay vì client từ getGoogleGenAiClient
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY1;
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY hoặc GOOGLE_API_KEY1 chưa được cấu hình trong .env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const fallbackList = process.env.GEMINI_IMAGE_ANALYSIS_MODELS_FALLBACK
    ? process.env.GEMINI_IMAGE_ANALYSIS_MODELS_FALLBACK.split(',').map((m) => m.trim()).filter(Boolean)
    : [];

  const modelsToTry = (GOOGLE_IMAGE_ANALYSIS_MODELS.length
    ? GOOGLE_IMAGE_ANALYSIS_MODELS
    : ['gemini-1.5-flash']).concat(fallbackList);

  const temperature = Number(process.env.GOOGLE_IMAGE_ANALYSIS_TEMPERATURE);
  const maxTokens = Number(process.env.GOOGLE_IMAGE_ANALYSIS_MAX_TOKENS);
  const generationConfig = {};

  if (Number.isFinite(temperature)) {
    generationConfig.temperature = temperature;
  } else {
    generationConfig.temperature = 0.2;
  }

  if (Number.isFinite(maxTokens) && maxTokens > 0) {
    generationConfig.maxOutputTokens = maxTokens;
  }

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig,
      });

      // Tạo content với text prompt và image
      const parts = [];
      if (prompt) {
        parts.push({ text: prompt });
      }
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBuffer.toString('base64'),
        },
      });

      const result = await model.generateContent(parts);
      const response = await result.response;
      
      // Extract text từ response
      const analysisText = response.text();
      
      if (!analysisText || !analysisText.trim()) {
        throw new Error('Google AI Studio không trả về nội dung phân tích.');
      }

      return analysisText.trim();
    } catch (error) {
      lastError = error;
      console.error(`[Gemini Image Analysis Error][${modelName}]`, error?.message || error);

      // Nếu model không available (404), thử model tiếp theo
      if (isModelUnavailableError(error)) {
        continue;
      }

      // Nếu lỗi không retryable, dừng lại
      if (!isRetryableGoogleError(error)) {
        break;
      }
    }
  }

  throw lastError || new Error('Không thể phân tích ảnh với Google AI Studio.');
}

/**
 * Phân tích ảnh - tự động chọn service
 * @param {Buffer} imageBuffer - Buffer của ảnh cần phân tích
 * @param {string} mimeType - MIME type của ảnh
 * @param {string} prompt - Prompt yêu cầu phân tích
 * @returns {Promise<string>} - Kết quả phân tích
 */
async function analyzeImage(imageBuffer, mimeType, prompt = '') {
  try {
    return await analyzeImageWithGemini(imageBuffer, mimeType, prompt);
  } catch (error) {
    console.error('[Image Analysis Error]', error);
    throw new Error(`Không thể phân tích ảnh bằng Google AI Studio. Chi tiết: ${error.message}`);
  }
}

/**
 * Tạo ảnh bằng Stability AI API (Stable Diffusion)
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn (width, height, etc.)
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageWithStabilityAI(prompt, options = {}) {
  try {
    const {
      width = 1024,
      height = 1024,
      steps = 30,
      cfgScale = 7.5,
    } = options;

    const apiKey = process.env.STABILITY_AI_API_KEY;
    if (!apiKey) {
      throw new Error('STABILITY_AI_API_KEY chưa được cấu hình trong .env');
    }

    // Stability AI API endpoint
    const engineId = process.env.STABILITY_AI_ENGINE || 'stable-diffusion-xl-1024-v1-0';
    const url = `https://api.stability.ai/v1/generation/${engineId}/text-to-image`;

    const response = await axios.post(
      url,
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1.0,
          },
        ],
        cfg_scale: cfgScale,
        height: height,
        width: width,
        steps: steps,
        samples: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        responseType: 'json',
      }
    );

    // Stability AI trả về base64 image
    const base64Image = response.data.artifacts[0].base64;
    return Buffer.from(base64Image, 'base64');
  } catch (error) {
    console.error('[Stability AI Error]', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Tạo ảnh bằng Replicate API (Stable Diffusion)
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn (width, height, etc.)
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageWithReplicate(prompt, options = {}) {
  try {
    const {
      width = 1024,
      height = 1024,
    } = options;

    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) {
      throw new Error('REPLICATE_API_TOKEN chưa được cấu hình trong .env');
    }

    // Replicate API endpoint
    const model = process.env.REPLICATE_MODEL || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
    const url = 'https://api.replicate.com/v1/predictions';

    // Tạo prediction
    const createResponse = await axios.post(
      url,
      {
        version: model,
        input: {
          prompt: prompt,
          width: width,
          height: height,
          num_outputs: 1,
        },
      },
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const predictionId = createResponse.data.id;
    let prediction = createResponse.data;

    // Polling để lấy kết quả
    while (prediction.status === 'starting' || prediction.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây
      
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        }
      );
      
      prediction = statusResponse.data;
    }

    if (prediction.status === 'succeeded' && prediction.output && prediction.output.length > 0) {
      // Download image từ URL
      const imageUrl = prediction.output[0];
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      
      return Buffer.from(imageResponse.data);
    } else {
      throw new Error(`Replicate prediction failed: ${prediction.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[Replicate Error]', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Tạo ảnh bằng Hugging Face Inference API (Stable Diffusion)
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn (width, height, etc.)
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageWithHuggingFace(prompt, options = {}) {
  try {
    const {
      width = 1024,
      height = 1024,
    } = options;

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY chưa được cấu hình trong .env');
    }

    // Hugging Face Inference API endpoint
    // Thử các models khác nhau nếu model đầu tiên không available
    const models = process.env.HUGGINGFACE_MODEL 
      ? [process.env.HUGGINGFACE_MODEL]
      : [
          'stabilityai/stable-diffusion-xl-base-1.0',
          'runwayml/stable-diffusion-v1-5',
          'CompVis/stable-diffusion-v1-4',
        ];

    let lastError = null;
    
    for (const model of models) {
      try {
        // Sử dụng endpoint mới: https://router.huggingface.co/hf-inference
        const url = `https://router.huggingface.co/hf-inference/models/${model}`;
        
        const response = await axios.post(
          url,
          {
            inputs: prompt,
            parameters: {
              width: width,
              height: height,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 60000, // 60 seconds timeout
          }
        );

        // Kiểm tra nếu response là JSON error (model đang loading)
        if (response.headers['content-type']?.includes('application/json')) {
          const jsonResponse = JSON.parse(response.data.toString());
          if (jsonResponse.error) {
            throw new Error(`Hugging Face model ${model} error: ${jsonResponse.error}`);
          }
        }

        return Buffer.from(response.data);
      } catch (error) {
        // Parse error message tốt hơn
        let errorMessage = error.message;
        if (error.response) {
          const status = error.response.status;
          const statusText = error.response.statusText;
          
          // Parse error body nếu có
          let errorBody = '';
          try {
            if (error.response.data instanceof Buffer) {
              errorBody = error.response.data.toString();
              const jsonError = JSON.parse(errorBody);
              errorBody = jsonError.error || jsonError.message || errorBody;
            } else if (typeof error.response.data === 'string') {
              errorBody = error.response.data;
            } else {
              errorBody = JSON.stringify(error.response.data);
            }
          } catch (parseError) {
            errorBody = error.response.data?.toString() || '';
          }
          
          errorMessage = `HTTP ${status} ${statusText}: ${errorBody || error.message}`;
          
          // Nếu là lỗi 410 (Gone) hoặc 404, thử model khác
          if (status === 410 || status === 404) {
            console.log(`[Hugging Face] Model ${model} không available (${status}), thử model khác...`);
            lastError = new Error(errorMessage);
            continue;
          }
        }
        
        lastError = new Error(errorMessage);
        
        // Nếu không phải lỗi model không available, throw ngay
        if (!error.response || (error.response.status !== 410 && error.response.status !== 404)) {
          throw lastError;
        }
      }
    }

    // Nếu tất cả models đều fail
    throw lastError || new Error('Tất cả Hugging Face models đều không available');
  } catch (error) {
    // Cải thiện error message
    let errorMessage = error.message;
    if (error.response) {
      try {
        if (error.response.data instanceof Buffer) {
          const jsonError = JSON.parse(error.response.data.toString());
          errorMessage = jsonError.error || jsonError.message || errorMessage;
        }
      } catch (parseError) {
        // Ignore parse error
      }
    }
    
    console.error('[Hugging Face Error]', errorMessage);
    throw new Error(`Hugging Face không available: ${errorMessage}`);
  }
}

/**
 * Tạo ảnh bằng Google Gemini (nếu có API key)
 * Sử dụng GOOGLE_API_KEY1 riêng cho tạo ảnh để tách biệt với GOOGLE_API_KEY (dùng cho text)
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageWithGemini(prompt, options = {}) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GOOGLE_API_KEY1;
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY1 chưa được cấu hình trong .env (dùng riêng cho tạo ảnh)');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const result = await model.generateContent([
      { text: prompt },
    ]);

    const response = await result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart) {
      throw new Error('Gemini không trả về ảnh render!');
    }

    return Buffer.from(imagePart.inlineData.data, 'base64');
  } catch (error) {
    console.error('[Gemini Image Generation Error]', error.message);
    throw error;
  }
}

/**
 * Tạo ảnh - tự động thử các external services theo thứ tự
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageExternal(prompt, options = {}) {
  const services = [
    { name: 'Stability AI', fn: generateImageWithStabilityAI },
    { name: 'Replicate', fn: generateImageWithReplicate },
    { name: 'Hugging Face', fn: generateImageWithHuggingFace },
    { name: 'Gemini', fn: generateImageWithGemini },
  ];

  let lastError = null;
  
  for (const service of services) {
    try {
      console.log(`[External AI] Thử ${service.name}...`);
      const result = await service.fn(prompt, options);
      console.log(`[External AI] Thành công với ${service.name}`);
      return result;
    } catch (error) {
      console.log(`[External AI] ${service.name} không available: ${error.message}`);
      lastError = error;
      continue;
    }
  }

  throw new Error(`Tất cả external AI services đều không available. Vui lòng cấu hình API keys trong .env. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Tạo ảnh từ nhiều services: Gemini (ưu tiên), Stability AI, Replicate, Hugging Face
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn
 * @returns {Promise<{single: Buffer|null, stability: Buffer|null, replicate: Buffer|null, huggingface: Buffer|null}>} - Kết quả ảnh (single = Gemini nếu có)
 */
async function generateImageFromThreeServices(prompt, options = {}) {
  const results = {
    single: null, // Gemini (ưu tiên)
    stability: null,
    replicate: null,
    huggingface: null,
  };

  // Log trạng thái API keys (chỉ log có/không có, không log giá trị)
  console.log('[External AI] Kiểm tra API keys cho tạo ảnh:');
  console.log(`  - GOOGLE_API_KEY1 (Gemini tạo ảnh): ${process.env.GOOGLE_API_KEY1 ? '✓ Có' : '✗ Thiếu'}`);
  console.log(`  - STABILITY_AI_API_KEY: ${process.env.STABILITY_AI_API_KEY ? '✓ Có' : '✗ Thiếu'}`);
  console.log(`  - REPLICATE_API_TOKEN: ${process.env.REPLICATE_API_TOKEN ? '✓ Có' : '✗ Thiếu'}`);
  console.log(`  - HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? '✓ Có' : '✗ Thiếu'}`);

  // Chạy song song tất cả services (Gemini ưu tiên, các service khác chạy song song)
  const promises = [
    // Gemini (ưu tiên vào single)
    generateImageWithGemini(prompt, options)
      .then(buffer => {
        results.single = buffer;
        console.log('[External AI] Gemini thành công');
      })
      .catch(error => {
        console.log(`[External AI] Gemini không available: ${error.message}`);
      }),
    
    generateImageWithStabilityAI(prompt, options)
      .then(buffer => {
        results.stability = buffer;
        console.log('[External AI] Stability AI thành công');
      })
      .catch(error => {
        console.log(`[External AI] Stability AI không available: ${error.message}`);
      }),
    
    generateImageWithReplicate(prompt, options)
      .then(buffer => {
        results.replicate = buffer;
        console.log('[External AI] Replicate thành công');
      })
      .catch(error => {
        console.log(`[External AI] Replicate không available: ${error.message}`);
      }),
    
    generateImageWithHuggingFace(prompt, options)
      .then(buffer => {
        results.huggingface = buffer;
        console.log('[External AI] Hugging Face thành công');
      })
      .catch(error => {
        console.log(`[External AI] Hugging Face không available: ${error.message}`);
      }),
  ];

  // Đợi tất cả promises hoàn thành
  await Promise.allSettled(promises);

  // Kiểm tra xem có ít nhất 1 kết quả không
  const hasAnyResult = results.single || results.stability || results.replicate || results.huggingface;
  if (!hasAnyResult) {
    // Kiểm tra các API keys có tồn tại không
    const missingKeys = [];
    if (!process.env.GOOGLE_API_KEY1) {
      missingKeys.push('GOOGLE_API_KEY1 (cho tạo ảnh)');
    }
    if (!process.env.STABILITY_AI_API_KEY) {
      missingKeys.push('STABILITY_AI_API_KEY');
    }
    if (!process.env.REPLICATE_API_TOKEN) {
      missingKeys.push('REPLICATE_API_TOKEN');
    }
    if (!process.env.HUGGINGFACE_API_KEY) {
      missingKeys.push('HUGGINGFACE_API_KEY');
    }

    let errorMessage = 'Tất cả services (Gemini, Stability AI, Replicate, Hugging Face) đều không available.';
    if (missingKeys.length > 0) {
      errorMessage += `\n\nCác API keys thiếu trong .env:\n- ${missingKeys.join('\n- ')}`;
    } else {
      errorMessage += '\n\nTất cả API keys đã được cấu hình nhưng các services vẫn không hoạt động. Vui lòng kiểm tra:\n';
      errorMessage += '1. API keys có đúng không?\n';
      errorMessage += '2. API keys có còn hạn không?\n';
      errorMessage += '3. Có lỗi kết nối mạng không?\n';
      errorMessage += '4. Server đã được restart sau khi thêm API keys vào .env chưa?';
    }
    
    throw new Error(errorMessage);
  }

  return results;
}

/**
 * Tạo ảnh từ ảnh gốc và prompt (image-to-image)
 * Ưu tiên dùng Gemini để tạo ảnh, nếu không có thì dùng external services khác
 * @param {Buffer} sourceImageBuffer - Buffer của ảnh gốc
 * @param {string} sourceMimeType - MIME type của ảnh gốc
 * @param {Buffer} referenceImageBuffer - Buffer của ảnh tham khảo (optional)
 * @param {string} referenceMimeType - MIME type của ảnh tham khảo (optional)
 * @param {string} prompt - Prompt mô tả yêu cầu
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageFromImages(sourceImageBuffer, sourceMimeType, referenceImageBuffer, referenceMimeType, prompt) {
  try {
    // Ưu tiên thử Gemini trước (vì Gemini hỗ trợ image-to-image tốt hơn)
    // Sử dụng GOOGLE_API_KEY1 cho tạo ảnh
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const apiKey = process.env.GOOGLE_API_KEY1;
      
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

        // Tạo content với ảnh gốc và prompt
        const content = [
          {
            inlineData: {
              mimeType: sourceMimeType,
              data: sourceImageBuffer.toString('base64'),
            },
          },
          { text: prompt },
        ];

        // Thêm ảnh tham khảo nếu có
        if (referenceImageBuffer && referenceMimeType) {
          content.unshift({
            inlineData: {
              mimeType: referenceMimeType,
              data: referenceImageBuffer.toString('base64'),
            },
          });
        }

        const result = await model.generateContent(content);
        const response = await result.response;
        const parts = response.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p) => p.inlineData);

        if (imagePart && imagePart.inlineData) {
          console.log('[Gemini] Tạo ảnh từ ảnh gốc thành công (dùng GOOGLE_API_KEY1)');
          return Buffer.from(imagePart.inlineData.data, 'base64');
        }
      }
    } catch (geminiError) {
      console.log('[Fallback] Gemini không available để tạo ảnh (GOOGLE_API_KEY1), thử enhance prompt và dùng services khác');
    }

    // Fallback: Dùng Gemini để enhance prompt (dùng GOOGLE_API_KEY cho text), sau đó dùng external services
    let enhancedPrompt = prompt;
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const apiKey = process.env.GOOGLE_API_KEY; // Dùng GOOGLE_API_KEY cho enhance prompt (text)
      
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const enhancePrompt = `
          You are an expert in creating prompts for AI image generation. 
          Based on the source image and the following requirements, create a detailed, specific prompt for Stable Diffusion:
          
          Requirements: ${prompt}
          
          The prompt must:
          - Describe in detail the style, colors, materials
          - Include technical keywords for Stable Diffusion
          - Be about 100-200 words long
          - Return only the prompt, no additional explanation
        `;

        const content = [
          {
            inlineData: {
              mimeType: sourceMimeType,
              data: sourceImageBuffer.toString('base64'),
            },
          },
          { text: enhancePrompt },
        ];

        if (referenceImageBuffer && referenceMimeType) {
          content.unshift({
            inlineData: {
              mimeType: referenceMimeType,
              data: referenceImageBuffer.toString('base64'),
            },
          });
        }

        const result = await model.generateContent(content);
        const response = await result.response;
        enhancedPrompt = response.text().trim();
        console.log('[Gemini] Enhanced prompt successfully');
      }
    } catch (geminiError) {
      console.log('[Fallback] Gemini không available để enhance prompt, sử dụng prompt gốc');
      // Sử dụng prompt gốc nếu Gemini không available
    }

    // Tạo ảnh bằng external services (ưu tiên Gemini trong generateImageExternal)
    return await generateImageExternal(enhancedPrompt, {
      width: 1024,
      height: 1024,
    });
  } catch (error) {
    console.error('[Image Generation Error]', error);
    throw error;
  }
}

module.exports = {
  analyzeImage, // Phân tích ảnh
  analyzeImageWithGemini, // Phân tích ảnh bằng Gemini
  generateImageWithStabilityAI,
  generateImageWithReplicate,
  generateImageWithHuggingFace,
  generateImageWithGemini, // Tạo ảnh bằng Gemini
  generateImageExternal, // Auto-select service
  generateImageFromThreeServices, // Tạo 3 ảnh từ 3 services
  generateImageFromImages, // Image-to-image generation
};

