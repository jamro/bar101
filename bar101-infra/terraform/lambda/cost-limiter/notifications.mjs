import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});

/**
 * Publish a notification to SNS
 * @param {string} topicArn - The SNS topic ARN
 * @param {string} subject - The notification subject
 * @param {string} message - The notification message
 */
export async function publishNotification(topicArn, subject, message) {
  if (!topicArn) {
    console.log('SNS_TOPIC_ARN not configured, skipping notification');
    return;
  }

  try {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: subject,
      Message: message
    });
    
    await snsClient.send(command);
    console.log(`Published SNS notification: ${subject}`);
  } catch (error) {
    console.error('Failed to publish SNS notification:', error);
  }
}

/**
 * Send notification when access is blocked
 * @param {string} topicArn - The SNS topic ARN
 * @param {string} bucketId - The S3 bucket name
 * @param {number} totalDownloadedBytes - Total downloaded bytes
 * @param {number} limitBytes - The daily limit in bytes
 */
export async function notifyAccessBlocked(topicArn, bucketId, totalDownloadedBytes, limitBytes) {
  const usageMB = Math.round(totalDownloadedBytes / (1024 * 1024));
  const limitMB = Math.round(limitBytes / (1024 * 1024));
  
  await publishNotification(
    topicArn,
    `🚨 Bar101 CDN Access Blocked - Limit Exceeded`,
    `The CDN bucket ${bucketId} has been automatically blocked due to exceeding the daily transfer limit.\n\n` +
    `Usage: ${usageMB} MB\n` +
    `Limit: ${limitMB} MB\n\n` +
    `Access will be automatically restored when usage drops below the limit or at the next daily reset.`
  );
}

/**
 * Send notification when access is restored
 * @param {string} topicArn - The SNS topic ARN
 * @param {string} bucketId - The S3 bucket name
 * @param {number} totalDownloadedBytes - Total downloaded bytes
 * @param {number} limitBytes - The daily limit in bytes
 */
export async function notifyAccessRestored(topicArn, bucketId, totalDownloadedBytes, limitBytes) {
  const usageMB = Math.round(totalDownloadedBytes / (1024 * 1024));
  const limitMB = Math.round(limitBytes / (1024 * 1024));
  
  await publishNotification(
    topicArn,
    `✅ Bar101 CDN Access Restored`,
    `The CDN bucket ${bucketId} access has been automatically restored.\n\n` +
    `Current usage: ${usageMB} MB\n` +
    `Daily limit: ${limitMB} MB\n\n` +
    `The bucket is now accessible again.`
  );
}

/**
 * Send notification when an error occurs
 * @param {string} topicArn - The SNS topic ARN
 * @param {Error} error - The error that occurred
 */
export async function notifyError(topicArn, error) {
  await publishNotification(
    topicArn,
    `❌ Bar101 Cost Limiter Error`,
    `The cost limiter Lambda function encountered an error:\n\n${error.message}\n\nPlease check the CloudWatch logs for more details.`
  );
} 