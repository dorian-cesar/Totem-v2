import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_S3_BUCKET || 'totem-publicidad-media';
const region = process.env.AWS_REGION || 'us-east-1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-file-name'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawFileName = req.query.fileName || req.headers['x-file-name'] || `video_${Date.now()}.mp4`;
    const safeName = decodeURIComponent(rawFileName).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const s3Key = `videos/${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: 'video/mp4'
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    console.log('[Presigned S3 URL Generada]:', safeName);

    return res.status(200).json({
      success: true,
      uploadUrl,
      publicUrl,
      fileName: safeName
    });
  } catch (error) {
    console.error('[Presigned S3 Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
