// Upload buffer lên Cloudinary bằng stream
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({ secure: true, url: process.env.CLOUDINARY_URL });

function uploadBufferToCloudinary(buffer, folder = 'exterior_ai') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });
}

module.exports = { uploadBufferToCloudinary };
