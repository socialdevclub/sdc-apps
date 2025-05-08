import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

export const dynamoDBConfig: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  },
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  region: process.env.AWS_REGION || 'ap-northeast-2',
};

export const STOCK_TABLE_NAME = 'stock-table';
export const STOCK_USER_TABLE_NAME = 'stock-user-table';
export const STOCK_LOG_TABLE_NAME = 'stock-log-table';
export const RESULT_TABLE_NAME = 'result-table';
