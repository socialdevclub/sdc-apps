import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { fromSSO } from '@aws-sdk/credential-providers';

export const dynamoDBConfig: DynamoDBClientConfig = {
  credentials: fromSSO({ profile: 'sdc-jhha' }),
  //   endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  region: 'ap-northeast-2',
};

export const STOCK_TABLE_NAME = 'sdc-stock';
export const STOCK_USER_TABLE_NAME = 'sdc-stock-user';
export const STOCK_LOG_TABLE_NAME = 'sdc-stock-log';
export const RESULT_TABLE_NAME = 'sdc-result';
