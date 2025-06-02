import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

/**
 * S3 bucket policy that allows public read access
 */
export const ALLOW_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: ""  // Will be set dynamically
    }
  ]
};

/**
 * S3 bucket policy that blocks public access
 */
export const BLOCK_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "BlockPublicAccess",
      Effect: "Deny",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: ""  // Will be set dynamically
    }
  ]
};

/**
 * Get the current bucket policy
 * @param {string} bucketName - The S3 bucket name
 * @returns {Promise<Object|null>} The current bucket policy or null if none exists
 */
export async function getCurrentBucketPolicy(bucketName) {
  try {
    const command = new GetBucketPolicyCommand({
      Bucket: bucketName
    });
    
    const response = await s3Client.send(command);
    return JSON.parse(response.Policy);
  } catch (error) {
    if (error.name === 'NoSuchBucketPolicy') {
      return null;
    }
    throw error;
  }
}

/**
 * Update the bucket policy
 * @param {string} bucketName - The S3 bucket name
 * @param {Object} policyTemplate - The policy template (ALLOW_POLICY or BLOCK_POLICY)
 */
export async function updateBucketPolicy(bucketName, policyTemplate) {
  // Create a copy of the policy template and set the resource ARN
  const policy = JSON.parse(JSON.stringify(policyTemplate));
  policy.Statement[0].Resource = `arn:aws:s3:::${bucketName}/*`;
  
  const command = new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(policy)
  });
  
  await s3Client.send(command);
  console.log(`Updated bucket policy for ${bucketName}`);
}

/**
 * Check if the bucket access is currently blocked
 * @param {Object|null} currentPolicy - The current bucket policy
 * @returns {boolean} True if access is blocked, false otherwise
 */
export function isAccessBlocked(currentPolicy) {
  if (!currentPolicy) {
    return false;
  }
  
  return currentPolicy.Statement?.some(
    statement => statement.Effect === "Deny" && statement.Sid === "BlockPublicAccess"
  ) || false;
}

/**
 * Block access to the S3 bucket
 * @param {string} bucketName - The S3 bucket name
 */
export async function blockAccess(bucketName) {
  await updateBucketPolicy(bucketName, BLOCK_POLICY);
  console.log(`Blocked public access to bucket: ${bucketName}`);
}

/**
 * Allow access to the S3 bucket
 * @param {string} bucketName - The S3 bucket name
 */
export async function allowAccess(bucketName) {
  await updateBucketPolicy(bucketName, ALLOW_POLICY);
  console.log(`Restored public access to bucket: ${bucketName}`);
} 