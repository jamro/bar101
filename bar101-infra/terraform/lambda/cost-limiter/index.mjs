import { getDownloadsFromTimeWindow } from './metrics.mjs';
import { 
  getCurrentBucketPolicy, 
  isAccessBlocked, 
  blockAccess, 
  allowAccess 
} from './s3-access-control.mjs';
import { 
  notifyAccessBlocked, 
  notifyAccessRestored, 
  notifyError 
} from './notifications.mjs';

const S3_BUCKET_ID = process.env.S3_BUCKET_ID || 'cdn-bar101.jmrlab.com';
const DAILY_TRANSFER_BYTES_LIMIT = parseInt(process.env.DAILY_TRANSFER_BYTES_LIMIT || '1073741824');
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const handler = async (event) => {
  try {
    const downloadData = await getDownloadsFromTimeWindow(S3_BUCKET_ID);
    const { totalDownloadedBytes } = downloadData;
    
    const isOverLimit = totalDownloadedBytes >= DAILY_TRANSFER_BYTES_LIMIT;
    const currentPolicy = await getCurrentBucketPolicy(S3_BUCKET_ID);
    const isCurrentlyBlocked = isAccessBlocked(currentPolicy);

    let action = null;
    let statusMessage = '';

    if (isOverLimit && !isCurrentlyBlocked) {
      // Block access
      await blockAccess(S3_BUCKET_ID);
      action = 'blocked';
      statusMessage = `Access blocked: Usage ${Math.round(totalDownloadedBytes / (1024 * 1024))} MB exceeds limit ${Math.round(DAILY_TRANSFER_BYTES_LIMIT / (1024 * 1024))} MB`;
      console.log(statusMessage);
      
      // Send notification
      await notifyAccessBlocked(SNS_TOPIC_ARN, S3_BUCKET_ID, totalDownloadedBytes, DAILY_TRANSFER_BYTES_LIMIT);
    } else if (!isOverLimit && isCurrentlyBlocked) {
      // Restore access
      await allowAccess(S3_BUCKET_ID);
      action = 'unblocked';
      statusMessage = `Access restored: Usage ${Math.round(totalDownloadedBytes / (1024 * 1024))} MB is within limit ${Math.round(DAILY_TRANSFER_BYTES_LIMIT / (1024 * 1024))} MB`;
      console.log(statusMessage);
      
      // Send notification
      await notifyAccessRestored(SNS_TOPIC_ARN, S3_BUCKET_ID, totalDownloadedBytes, DAILY_TRANSFER_BYTES_LIMIT);
    } else {
      // No action needed
      action = 'no_change';
      statusMessage = isOverLimit 
        ? `Access remains blocked: Usage ${Math.round(totalDownloadedBytes / (1024 * 1024))} MB exceeds limit`
        : `Access remains allowed: Usage ${Math.round(totalDownloadedBytes / (1024 * 1024))} MB is within limit`;
      console.log(statusMessage);
    }

    return {
      statusCode: 200,
      body: {
        bucket: S3_BUCKET_ID,
        ...downloadData,
        limitBytes: DAILY_TRANSFER_BYTES_LIMIT,
        limitMB: Math.round(DAILY_TRANSFER_BYTES_LIMIT / (1024 * 1024)),
        isOverLimit,
        action,
        statusMessage,
        isBlocked: isOverLimit
      }
    };
  } catch (err) {
    console.error('Error in cost limiter:', err);
    
    // Send error notification
    await notifyError(SNS_TOPIC_ARN, err);
    
    return {
      statusCode: 500,
      body: { 
        error: 'Failed to process cost limiting',
        details: err.message 
      }
    };
  }
}; 