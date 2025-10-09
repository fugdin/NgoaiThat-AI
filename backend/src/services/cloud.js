// Upload buffer lên Cloudinary bằng stream
const { v2: cloudinary } = require('cloudinary');
cloudinary.config({ secure: true, url: process.env.CLOUDINARY_URL });

async function uploadBufferToCloudinary(buffer, folder = 'exterior_ai') {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', timeout: 60000 },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    } catch (error) {
      console.error('[Cloudinary Upload Error]', error);
      reject(error);
    }
  });
}

module.exports = { uploadBufferToCloudinary };

