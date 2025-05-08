#!/usr/bin/env node

import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import {
  dynamoDBConfig,
  STOCK_TABLE_NAME,
  STOCK_USER_TABLE_NAME,
  STOCK_LOG_TABLE_NAME,
  RESULT_TABLE_NAME,
} from '../config/dynamodb.config';

const createStockTable = async (ddbClient: DynamoDBClient) => {
  const params = {
    AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
    KeySchema: [
      { AttributeName: '_id', KeyType: 'HASH' }, // Partition key
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    TableName: STOCK_TABLE_NAME,
  };

  try {
    const data = await ddbClient.send(new CreateTableCommand(params));
    console.log(`테이블 ${STOCK_TABLE_NAME} 생성 완료:`, data);
    return data;
  } catch (err) {
    console.error(`테이블 ${STOCK_TABLE_NAME} 생성 중 오류:`, err);
    throw err;
  }
};

const createStockUserTable = async (ddbClient: DynamoDBClient) => {
  const params = {
    AttributeDefinitions: [
      { AttributeName: 'stockId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    // stockId-index 글로벌 보조 인덱스 추가
    GlobalSecondaryIndexes: [
      {
        IndexName: 'stockId-index',
        KeySchema: [{ AttributeName: 'stockId', KeyType: 'HASH' }],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],

    KeySchema: [
      { AttributeName: 'stockId', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'userId', KeyType: 'RANGE' }, // Sort key
    ],

    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    TableName: STOCK_USER_TABLE_NAME,
  };

  try {
    const data = await ddbClient.send(new CreateTableCommand(params));
    console.log(`테이블 ${STOCK_USER_TABLE_NAME} 생성 완료:`, data);
    return data;
  } catch (err) {
    console.error(`테이블 ${STOCK_USER_TABLE_NAME} 생성 중 오류:`, err);
    throw err;
  }
};

const createStockLogTable = async (ddbClient: DynamoDBClient) => {
  const params = {
    AttributeDefinitions: [
      { AttributeName: 'stockId', AttributeType: 'S' },
      { AttributeName: 'date', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    // userId에 대한 글로벌 보조 인덱스 추가
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'date', KeyType: 'RANGE' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],

    KeySchema: [
      { AttributeName: 'stockId', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'date', KeyType: 'RANGE' }, // Sort key
    ],

    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    TableName: STOCK_LOG_TABLE_NAME,
  };

  try {
    const data = await ddbClient.send(new CreateTableCommand(params));
    console.log(`테이블 ${STOCK_LOG_TABLE_NAME} 생성 완료:`, data);
    return data;
  } catch (err) {
    console.error(`테이블 ${STOCK_LOG_TABLE_NAME} 생성 중 오류:`, err);
    throw err;
  }
};

const createResultTable = async (ddbClient: DynamoDBClient) => {
  const params = {
    AttributeDefinitions: [
      { AttributeName: 'stockId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'round', AttributeType: 'N' },
    ],
    // round에 대한 글로벌 보조 인덱스 추가
    GlobalSecondaryIndexes: [
      {
        IndexName: 'round-index',
        KeySchema: [
          { AttributeName: 'stockId', KeyType: 'HASH' },
          { AttributeName: 'round', KeyType: 'RANGE' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],

    KeySchema: [
      { AttributeName: 'stockId', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'userId', KeyType: 'RANGE' }, // Sort key
    ],

    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    TableName: RESULT_TABLE_NAME,
  };

  try {
    const data = await ddbClient.send(new CreateTableCommand(params));
    console.log(`테이블 ${RESULT_TABLE_NAME} 생성 완료:`, data);
    return data;
  } catch (err) {
    console.error(`테이블 ${RESULT_TABLE_NAME} 생성 중 오류:`, err);
    throw err;
  }
};

(async () => {
  try {
    const ddbClient = new DynamoDBClient(dynamoDBConfig);

    // 모든 테이블 생성
    await Promise.all([
      createStockTable(ddbClient),
      createStockUserTable(ddbClient),
      createStockLogTable(ddbClient),
      createResultTable(ddbClient),
    ]);

    console.log('모든 DynamoDB 테이블이 성공적으로 생성되었습니다.');
  } catch (error) {
    console.error('DynamoDB 테이블 생성 중 오류 발생:', error);
  }
})();
