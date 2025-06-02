import { getDownloadsFromTimeWindow } from './metrics.mjs';

const S3_BUCKET_ID = process.env.S3_BUCKET_ID || 'cdn-bar101.jmrlab.com';

export const handler = async (event) => {
  try {
    const downloadData = await getDownloadsFromTimeWindow(S3_BUCKET_ID);

    return {
      statusCode: 200,
      body: JSON.stringify({
        bucket: S3_BUCKET_ID,
        ...downloadData
      })
    };
  } catch (err) {
    console.error('Error fetching metric data:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch metric data' })
    };
  }
}; 