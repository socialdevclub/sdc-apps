import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { fromSSO } from '@aws-sdk/credential-providers';

const { AWS_EXECUTION_ENV } = process.env;

export const dynamoDBConfig: DynamoDBClientConfig = AWS_EXECUTION_ENV?.startsWith('AWS_Lambda_') // 람다 환경에서 돌아가는지?
  ? { region: 'ap-northeast-2' }
  : {
      credentials: fromSSO({ profile: 'sdc-jhha' }),
      //   endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
      region: 'ap-northeast-2',
    };

export const STOCK_TABLE_NAME = 'sdc-stock';
export const STOCK_USER_TABLE_NAME = 'sdc-stock-user';
export const STOCK_LOG_TABLE_NAME = 'sdc-stock-log';
export const RESULT_TABLE_NAME = 'sdc-result';
