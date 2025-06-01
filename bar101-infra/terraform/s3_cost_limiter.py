import json
import boto3
import os
from datetime import datetime

s3_client = boto3.client('s3')
sns_client = boto3.client('sns')

BUCKET_NAME = os.environ['BUCKET_NAME']
SNS_TOPIC_ARN = os.environ['SNS_TOPIC_ARN']

def handler(event, context):
    """Main Lambda handler function for S3 cost limiting"""
    action = event.get('action', 'block')
    
    if action == 'block':
        block_s3_access()
    elif action == 'unblock':
        restore_s3_access()
    else:
        return {
            'statusCode': 400,
            'body': json.dumps(f'Invalid action: {action}')
        }
    
    return {
        'statusCode': 200,
        'body': json.dumps(f'S3 access {action}ed successfully')
    }

def block_s3_access():
    """Block all public access to S3 bucket when cost limit exceeded"""
    blocked_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "CostLimitExceeded",
                "Effect": "Deny",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*",
                "Condition": {
                    "StringNotEquals": {
                        "aws:PrincipalServiceName": "lambda.amazonaws.com"
                    }
                }
            }
        ]
    }
    
    try:
        s3_client.put_bucket_policy(
            Bucket=BUCKET_NAME,
            Policy=json.dumps(blocked_policy)
        )
        
        # Send notification
        sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"🚨 S3 Access Blocked - Cost Limit Exceeded",
            Message=f"Daily cost limit exceeded for {BUCKET_NAME}.\n"
                   f"Access blocked until midnight UTC.\n"
                   f"Time: {datetime.utcnow().isoformat()}Z"
        )
        
        print(f"Successfully blocked access to {BUCKET_NAME}")
        
    except Exception as e:
        error_msg = f"Error blocking access to {BUCKET_NAME}: {str(e)}"
        print(error_msg)
        
        # Send error notification
        sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"❌ Error Blocking S3 Access",
            Message=f"Failed to block access to {BUCKET_NAME}.\n"
                   f"Error: {str(e)}\n"
                   f"Time: {datetime.utcnow().isoformat()}Z"
        )
        raise

def restore_s3_access():
    """Restore normal S3 bucket policy for public access"""
    normal_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
            }
        ]
    }
    
    try:
        s3_client.put_bucket_policy(
            Bucket=BUCKET_NAME,
            Policy=json.dumps(normal_policy)
        )
        
        # Send notification
        sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"✅ S3 Access Restored",
            Message=f"Daily cost limit reset. Access restored to {BUCKET_NAME}.\n"
                   f"New billing cycle started.\n"
                   f"Time: {datetime.utcnow().isoformat()}Z"
        )
        
        print(f"Successfully restored access to {BUCKET_NAME}")
        
    except Exception as e:
        error_msg = f"Error restoring access to {BUCKET_NAME}: {str(e)}"
        print(error_msg)
        
        # Send error notification
        sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"❌ Error Restoring S3 Access",
            Message=f"Failed to restore access to {BUCKET_NAME}.\n"
                   f"Error: {str(e)}\n"
                   f"Time: {datetime.utcnow().isoformat()}Z"
        )
        raise 