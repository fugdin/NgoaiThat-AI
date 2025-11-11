// Upload buffer lên AWS S3 và AWS AI Services
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { RekognitionClient, DetectLabelsCommand, DetectModerationLabelsCommand } = require('@aws-sdk/client-rekognition');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Khởi tạo S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Khởi tạo Bedrock Runtime Client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Khởi tạo Rekognition Client (không cần approval)
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Model IDs - Array để thử từng model cho đến khi tìm được model hoạt động
// Lưu ý: Model IDs có thể thay đổi theo region và version
// Kiểm tra model IDs available trong AWS Bedrock console: https://console.aws.amazon.com/bedrock/

// Claude models - thử từng model cho đến khi tìm được model available
const CLAUDE_MODEL_IDS = process.env.AWS_BEDROCK_CLAUDE_MODEL 
  ? [process.env.AWS_BEDROCK_CLAUDE_MODEL]
  : [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'anthropic.claude-3-5-sonnet-20240926-v2:0',
      'anthropic.claude-3-opus-20240229-v1:0',
      'anthropic.claude-3-sonnet-20240229-v1:0',
    ];

// Stable Diffusion models - thử từng model cho đến khi tìm được model available
const STABLE_DIFFUSION_MODEL_IDS = process.env.AWS_BEDROCK_SD_MODEL
  ? [process.env.AWS_BEDROCK_SD_MODEL]
  : [
      'stability.stable-diffusion-xl-base-v1:0',
      'stability.stable-diffusion-xl-v1:0',
      'stability.stable-diffusion-xl-v0:9',
    ];

// Titan Image Generator models - thử từng model cho đến khi tìm được model available
const TITAN_IMAGE_MODEL_IDS = process.env.AWS_BEDROCK_TITAN_MODEL
  ? [process.env.AWS_BEDROCK_TITAN_MODEL]
  : [
      'amazon.titan-image-generator-v1',
      'amazon.titan-image-generator-v2:0',
    ];

// Chọn service mặc định (có thể override bằng env)
const USE_REKOGNITION = process.env.AWS_USE_REKOGNITION === 'true';
const USE_TITAN = process.env.AWS_USE_TITAN === 'true';

/**
 * Upload buffer lên S3
 * @param {Buffer} buffer - Buffer của file cần upload
 * @param {string} folder - Thư mục trong S3 (ví dụ: 'exterior_ai/samples')
 * @param {string} mimeType - MIME type của file (ví dụ: 'image/jpeg')
 * @returns {Promise<{secure_url: string, public_id: string}>} - URL và key của file đã upload
 */
async function uploadBufferToS3(buffer, folder = 'exterior_ai', mimeType = 'image/jpeg') {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME chưa được cấu hình trong .env');
    }

    // Tạo tên file unique
    const fileName = `${uuidv4()}.${mimeType.split('/')[1] || 'jpg'}`;
    const key = folder ? `${folder}/${fileName}` : fileName;

    // Upload lên S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read', // Hoặc 'private' nếu muốn private
    });

    await s3Client.send(command);

    // Tạo URL công khai
    const secure_url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    // Nếu sử dụng CloudFront hoặc custom domain, có thể override URL
    const publicUrl = process.env.AWS_CLOUDFRONT_URL 
      ? `${process.env.AWS_CLOUDFRONT_URL}/${key}`
      : secure_url;

    return {
      secure_url: publicUrl,
      public_id: key,
      url: publicUrl,
    };
  } catch (error) {
    console.error('[AWS S3 Upload Error]', error);
    throw error;
  }
}

/**
 * Phân tích ảnh bằng Amazon Rekognition (KHÔNG CẦN APPROVAL)
 * @param {Buffer} imageBuffer - Buffer của ảnh cần phân tích
 * @param {string} mimeType - MIME type của ảnh (ví dụ: 'image/jpeg')
 * @returns {Promise<string>} - Kết quả phân tích dạng text
 */
async function analyzeImageWithRekognition(imageBuffer, mimeType) {
  try {
    const command = new DetectLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MaxLabels: 20,
      MinConfidence: 70,
    });

    const response = await rekognitionClient.send(command);
    
    // Format kết quả thành text mô tả
    const labels = response.Labels || [];
    const labelNames = labels.map(l => l.Name).join(', ');
    const topLabels = labels.slice(0, 10).map(l => `${l.Name} (${Math.round(l.Confidence)}%)`).join('\n');
    
    // Tạo summary dựa trên labels
    const buildingRelated = labels.filter(l => 
      ['Building', 'Architecture', 'House', 'Structure', 'Construction'].some(term => 
        l.Name.toLowerCase().includes(term.toLowerCase())
      )
    );
    
    const colorLabels = labels.filter(l => 
      ['Color', 'Red', 'Blue', 'Green', 'Yellow', 'White', 'Black', 'Brown', 'Gray'].some(term => 
        l.Name.toLowerCase().includes(term.toLowerCase())
      )
    );

    let summary = `Phân tích ảnh ngoại thất:\n\n`;
    summary += `Các đối tượng phát hiện: ${labelNames}\n\n`;
    summary += `Chi tiết:\n${topLabels}\n\n`;
    
    if (buildingRelated.length > 0) {
      summary += `Đặc điểm kiến trúc: ${buildingRelated.map(l => l.Name).join(', ')}\n`;
    }
    
    if (colorLabels.length > 0) {
      summary += `Màu sắc: ${colorLabels.map(l => l.Name).join(', ')}\n`;
    }
    
    summary += `\nTừ khóa cho AI: ${labels.slice(0, 15).map(l => l.Name.toLowerCase()).join(', ')}`;
    
    return summary;
  } catch (error) {
    console.error('[AWS Rekognition Error]', error);
    throw error;
  }
}

/**
 * Phân tích ảnh bằng Claude (Amazon Bedrock) - CẦN APPROVAL
 * Thử từng model ID trong array cho đến khi tìm được model hoạt động
 * @param {Buffer} imageBuffer - Buffer của ảnh cần phân tích
 * @param {string} mimeType - MIME type của ảnh (ví dụ: 'image/jpeg')
 * @param {string} prompt - Prompt yêu cầu phân tích
 * @returns {Promise<string>} - Kết quả phân tích dạng text
 */
async function analyzeImageWithClaude(imageBuffer, mimeType, prompt) {
  const base64Image = imageBuffer.toString('base64');
  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  };

  // Thử từng model ID trong array
  let lastError = null;
  for (const modelId of CLAUDE_MODEL_IDS) {
    try {
      console.log(`[Claude] Thử model: ${modelId}`);
      const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`[Claude] Thành công với model: ${modelId}`);
      return responseBody.content[0].text;
    } catch (error) {
      console.log(`[Claude] Model ${modelId} không available: ${error.message}`);
      lastError = error;
      
      // Nếu là lỗi use case details, không thử model khác nữa
      if (error.message && error.message.includes('use case details')) {
        console.log('[Fallback] Claude cần approval, sử dụng Rekognition thay thế');
        return analyzeImageWithRekognition(imageBuffer, mimeType);
      }
      
      // Tiếp tục thử model tiếp theo
      continue;
    }
  }

  // Nếu tất cả models đều fail, fallback to Rekognition
  console.error('[AWS Bedrock Claude Error] Tất cả models đều không available:', lastError);
  console.log('[Fallback] Sử dụng Rekognition thay cho Claude');
  return analyzeImageWithRekognition(imageBuffer, mimeType);
}

/**
 * Phân tích ảnh - tự động chọn service (Rekognition hoặc Claude)
 * @param {Buffer} imageBuffer - Buffer của ảnh cần phân tích
 * @param {string} mimeType - MIME type của ảnh
 * @param {string} prompt - Prompt yêu cầu phân tích (optional cho Rekognition)
 * @returns {Promise<string>} - Kết quả phân tích
 */
async function analyzeImage(imageBuffer, mimeType, prompt = '') {
  if (USE_REKOGNITION) {
    return analyzeImageWithRekognition(imageBuffer, mimeType);
  }
  
  try {
    return await analyzeImageWithClaude(imageBuffer, mimeType, prompt);
  } catch (error) {
    // Fallback to Rekognition nếu Claude không available
    console.log('[Fallback] Sử dụng Rekognition thay cho Claude');
    return analyzeImageWithRekognition(imageBuffer, mimeType);
  }
}

/**
 * Tạo ảnh bằng Stable Diffusion XL (Amazon Bedrock)
 * Thử từng model ID trong array cho đến khi tìm được model hoạt động
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn (width, height, seed, etc.)
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImconst prompt = `
You are an architectural engineer. Please analyze this exterior image and describe:
- The overall architectural style
- The main materials used
- The dominant color scheme
- The notable features (balcony, roof, lighting, doors, etc.)
- Short descriptive keywords for AI to generate similar images
`;
ageWithStableDiffusion(prompt, options = {}) {
  // Đảm bảo width và height luôn có giá trị để dùng trong fallback
  const {
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 1000000),
    steps = 30,
    cfgScale = 7.5,
  } = options;

  const requestBody = {
    text_prompts: [
      {
        text: prompt,
        weight: 1.0,
      },
    ],
    cfg_scale: cfgScale,
    seed: seed,
    steps: steps,
    width: width,
    height: height,
  };

  // Thử từng model ID trong array
  let lastError = null;
  for (const modelId of STABLE_DIFFUSION_MODEL_IDS) {
    try {
      console.log(`[Stable Diffusion] Thử model: ${modelId}`);
      const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      // Stable Diffusion trả về base64 image
      const base64Image = responseBody.artifacts[0].base64;
      console.log(`[Stable Diffusion] Thành công với model: ${modelId}`);
      return Buffer.from(base64Image, 'base64');
    } catch (error) {
      console.log(`[Stable Diffusion] Model ${modelId} không available: ${error.message}`);
      lastError = error;
      
      // Tiếp tục thử model tiếp theo
      continue;
    }
  }

  // Nếu tất cả Stable Diffusion models đều fail, fallback to Titan, sau đó external services
  console.error('[AWS Bedrock Stable Diffusion Error] Tất cả models đều không available:', lastError);
  console.log('[Fallback] Stable Diffusion không available, thử Titan Image Generator...');
  try {
    return await generateImageWithTitan(prompt, { width, height });
  } catch (titanError) {
    console.error('[AWS Bedrock Titan Fallback Error]', titanError);
    console.log('[Fallback] AWS Bedrock không available, thử external AI services...');
    
    try {
      const { generateImageExternal } = require('./external-ai');
      return await generateImageExternal(prompt, { width, height });
    } catch (externalError) {
      console.error('[External AI Fallback Error]', externalError);
      throw new Error(`Tất cả AI services (AWS Bedrock và External) đều không available. Vui lòng enable model trong AWS Bedrock console hoặc cấu hình external API keys. Original error: ${lastError?.message || 'Unknown error'}`);
    }
  }
}

/**
 * Tạo ảnh bằng Amazon Titan Image Generator (KHÔNG CẦN APPROVAL, chỉ cần enable trong Bedrock)
 * Thử từng model ID trong array cho đến khi tìm được model hoạt động
 * @param {string} prompt - Prompt mô tả ảnh cần tạo
 * @param {Object} options - Các tùy chọn
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageWithTitan(prompt, options = {}) {
  const {
    width = 1024,
    height = 1024,
    numberOfImages = 1,
  } = options;

  const requestBody = {
    taskType: 'TEXT_IMAGE',
    textToImageParams: {
      text: prompt,
      negativeText: 'blurry, low quality, distorted',
    },
    imageGenerationConfig: {
      numberOfImages: numberOfImages,
      height: height,
      width: width,
      cfgScale: 8.0,
    },
  };

  // Thử từng model ID trong array
  let lastError = null;
  for (const modelId of TITAN_IMAGE_MODEL_IDS) {
    try {
      console.log(`[Titan] Thử model: ${modelId}`);
      const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      // Titan trả về base64 image trong images array
      const base64Image = responseBody.images[0];
      console.log(`[Titan] Thành công với model: ${modelId}`);
      return Buffer.from(base64Image, 'base64');
    } catch (error) {
      console.log(`[Titan] Model ${modelId} không available: ${error.message}`);
      lastError = error;
      
      // Tiếp tục thử model tiếp theo
      continue;
    }
  }

  // Nếu tất cả Titan models đều fail, fallback to external services
  console.error('[AWS Bedrock Titan Error] Tất cả models đều không available:', lastError);
  console.log('[Fallback] AWS Bedrock không available, thử external AI services...');
  
  try {
    const { generateImageExternal } = require('./external-ai');
    return await generateImageExternal(prompt, { width, height });
  } catch (externalError) {
    console.error('[External AI Fallback Error]', externalError);
    throw new Error(`Tất cả AI services (AWS Bedrock và External) đều không available. Vui lòng enable model trong AWS Bedrock console hoặc cấu hình external API keys. Original error: ${lastError?.message || 'Unknown error'}`);
  }
}

/**
 * Tạo ảnh từ ảnh gốc và prompt (image-to-image)
 * Sử dụng Rekognition để phân tích ảnh và tạo prompt, sau đó dùng Stable Diffusion hoặc Titan
 * @param {Buffer} sourceImageBuffer - Buffer của ảnh gốc
 * @param {string} sourceMimeType - MIME type của ảnh gốc
 * @param {Buffer} referenceImageBuffer - Buffer của ảnh tham khảo (optional)
 * @param {string} referenceMimeType - MIME type của ảnh tham khảo (optional)
 * @param {string} prompt - Prompt mô tả yêu cầu
 * @returns {Promise<Buffer>} - Buffer của ảnh đã tạo
 */
async function generateImageFromImages(sourceImageBuffer, sourceMimeType, referenceImageBuffer, referenceMimeType, prompt) {
  try {
    let enhancedPrompt = prompt;
    
    // Nếu có Claude available, dùng Claude để enhance prompt
    // Nếu không, dùng Rekognition để phân tích và tạo prompt
    try {
      const claudePrompt = `
        Bạn là chuyên gia tạo prompt cho AI image generation. 
        Dựa trên ảnh nguồn và yêu cầu sau, hãy tạo một prompt chi tiết, cụ thể cho Stable Diffusion:
        
        Yêu cầu: ${prompt}
        
        Prompt phải:
        - Mô tả chi tiết phong cách, màu sắc, vật liệu
        - Bao gồm các từ khóa kỹ thuật cho Stable Diffusion
        - Dài khoảng 100-200 từ
        - Chỉ trả về prompt, không có giải thích thêm
      `;

      const sourceBase64 = sourceImageBuffer.toString('base64');
      const content = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: sourceMimeType,
            data: sourceBase64,
          },
        },
        {
          type: 'text',
          text: claudePrompt,
        },
      ];

      if (referenceImageBuffer && referenceMimeType) {
        const refBase64 = referenceImageBuffer.toString('base64');
        content.unshift({
          type: 'image',
          source: {
            type: 'base64',
            media_type: referenceMimeType,
            data: refBase64,
          },
        });
      }

      const requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: content,
          },
        ],
      };

      // Thử từng Claude model ID trong array
      let claudeSuccess = false;
      for (const modelId of CLAUDE_MODEL_IDS) {
        try {
          console.log(`[Claude] Thử model: ${modelId} để enhance prompt`);
          const command = new InvokeModelCommand({
            modelId: modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(requestBody),
          });

          const response = await bedrockClient.send(command);
          const responseBody = JSON.parse(new TextDecoder().decode(response.body));
          enhancedPrompt = responseBody.content[0].text.trim();
          claudeSuccess = true;
          console.log(`[Claude] Thành công với model: ${modelId}`);
          break;
        } catch (claudeError) {
          console.log(`[Claude] Model ${modelId} không available: ${claudeError.message}`);
          
          // Nếu là lỗi use case details, không thử model khác nữa
          if (claudeError.message && claudeError.message.includes('use case details')) {
            break;
          }
          
          // Tiếp tục thử model tiếp theo
          continue;
        }
      }
      
      // Nếu Claude không available, sẽ fallback sang Rekognition ở catch block bên dưới
      if (!claudeSuccess) {
        throw new Error('Claude không available');
      }
    } catch (claudeError) {
      // Fallback: Dùng Rekognition để phân tích và enhance prompt
      console.log('[Fallback] Sử dụng Rekognition để enhance prompt');
      const sourceAnalysis = await analyzeImageWithRekognition(sourceImageBuffer, sourceMimeType);
      const refAnalysis = referenceImageBuffer 
        ? await analyzeImageWithRekognition(referenceImageBuffer, referenceMimeType)
        : '';
      
      enhancedPrompt = `${prompt}. Dựa trên phân tích: ${sourceAnalysis}. ${refAnalysis ? `Tham khảo: ${refAnalysis}` : ''}`;
    }

    // Tạo ảnh bằng Stable Diffusion hoặc Titan
    // Nếu USE_TITAN = true, dùng Titan trực tiếp
    // Nếu không, thử Stable Diffusion trước, nếu fail thì fallback sang Titan
    if (USE_TITAN) {
      console.log('Generating image with Titan');
      return await generateImageWithTitan(enhancedPrompt, {
        width: 1024,
        height: 1024,
      });
    } else {
      try {
        console.log('Generating image with Stable Diffusion');
        return await generateImageWithStableDiffusion(enhancedPrompt, {
          width: 1024,
          height: 1024,
        });
      } catch (sdError) {
        // Fallback to Titan nếu Stable Diffusion fail
        console.log('[Fallback] Stable Diffusion không available, thử Titan Image Generator...');
        try {
          return await generateImageWithTitan(enhancedPrompt, {
            width: 1024,
            height: 1024,
          });
        } catch (titanError) {
          // Fallback to external services nếu Titan cũng fail
          console.log('[Fallback] AWS Bedrock không available, thử external AI services...');
          const { generateImageExternal } = require('./external-ai');
          return await generateImageExternal(enhancedPrompt, {
            width: 1024,
            height: 1024,
          });
        }
      }
    }
  } catch (error) {
    console.error('[AWS Bedrock Image Generation Error]', error);
    throw error;
  }
}

module.exports = { 
  uploadBufferToS3,
  analyzeImage, // Auto-select service
  analyzeImageWithRekognition, // Không cần approval
  analyzeImageWithClaude, // Cần approval
  generateImageWithStableDiffusion,
  generateImageWithTitan, // Không cần approval (chỉ cần enable)
  generateImageFromImages,
};

