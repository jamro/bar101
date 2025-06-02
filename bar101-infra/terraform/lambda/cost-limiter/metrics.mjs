import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const client = new CloudWatchClient({});

export async function getDownloadsFromTimeWindow(bucketName, timeWindow=24 * 60 * 60 * 1000) {
  const now = new Date(Date.now());
  const startTime = new Date(now.getTime() - timeWindow);

  const params = {
    StartTime: startTime,
    EndTime: now,
    MetricDataQueries: [
      {
        Id: 'downloadedBytes',
        MetricStat: {
          Metric: {
            Namespace: 'AWS/S3',
            MetricName: 'BytesDownloaded',
            Dimensions: [
              { Name: 'BucketName', Value: bucketName },
              { Name: 'FilterId', Value: 'EntireBucket' }
            ]
          },
          Period: 300,
          Stat: 'Sum',
        },
        ReturnData: true
      }
    ]
  };

  const command = new GetMetricDataCommand(params);
  const data = await client.send(command);
  const downloadedBytes = data.MetricDataResults[0]?.Values?.reduce((a, b) => a + b, 0) || 0;

  console.log(`Total downloaded in last 24h: ${downloadedBytes} bytes`);
  
  return {
    totalDownloadedBytes: downloadedBytes,
    downloadedMB: Math.round((downloadedBytes / (1024 * 1024)) * 100) / 100
  };
} 