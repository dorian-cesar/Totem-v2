import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: false // Streaming binario sin límite de tamaño de archivo MP4
  }
};

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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const rawFileName = req.headers['x-file-name'] || `video_${Date.now()}.mp4`;
    const safeName = decodeURIComponent(rawFileName).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const s3Key = `videos/${safeName}`;

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    console.log(`[Upload S3] Subiendo ${safeName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB) a AWS S3...`);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: 'video/mp4'
      })
    );

    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    console.log('[Upload S3 OK]:', s3Url);

    return res.status(200).json({ success: true, url: s3Url, fileName: safeName });
  } catch (error) {
    console.error('[Upload S3 Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
