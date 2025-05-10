import { Injectable, Inject } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { StockSchemaWithId } from 'shared~type-stock';
import { randomUUID } from 'crypto';
import { STOCK_TABLE_NAME } from './config/dynamodb.config';
import { Stock } from './stock.schema';

@Injectable()
export class StockRepository {
  constructor(
    @Inject('DYNAMODB_CLIENT')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async find(filter?: Record<string, any>): Promise<StockSchemaWithId[]> {
    try {
      const command = new ScanCommand({
        TableName: STOCK_TABLE_NAME,
        ...this.buildFilterExpression(filter),
      });

      const { Items } = await this.dynamoDBClient.send(command);
      return Items as StockSchemaWithId[];
    } catch (error) {
      console.error('Error scanning stocks', error);
      throw error;
    }
  }

  async findOneById(stockId: string): Promise<StockSchemaWithId | null> {
    try {
      const command = new GetCommand({
        Key: { _id: stockId },
        TableName: STOCK_TABLE_NAME,
      });

      const { Item } = await this.dynamoDBClient.send(command);
      return Item as StockSchemaWithId;
    } catch (error) {
      console.error('Error getting stock by id', error);
      throw error;
    }
  }

  async findOneAndUpdate(stockId: string, update: Partial<Stock>): Promise<StockSchemaWithId | null> {
    try {
      if (update._id) {
        delete update._id;
      }

      const { updateExpression, expressionAttributeValues, expressionAttributeNames } =
        this.buildUpdateExpression(update);

      const command = new UpdateCommand({
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        Key: { _id: stockId },
        ReturnValues: 'ALL_NEW',
        TableName: STOCK_TABLE_NAME,
        UpdateExpression: updateExpression,
      });

      const { Attributes } = await this.dynamoDBClient.send(command);
      return Attributes as StockSchemaWithId;
    } catch (error) {
      console.error('Error updating stock by id', error);
      throw error;
    }
  }

  async create(): Promise<StockSchemaWithId> {
    try {
      const newStock = new Stock();

      const _id = randomUUID();
      const stockWithId = { ...newStock, _id };

      const command = new PutCommand({
        Item: stockWithId,
        TableName: STOCK_TABLE_NAME,
      });

      await this.dynamoDBClient.send(command);
      return stockWithId;
    } catch (error) {
      console.error('Error creating stock', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateOne(filter: Record<string, any>, update: Partial<Stock>): Promise<boolean> {
    try {
      // DynamoDB는 filter 기반 업데이트를 직접 지원하지 않습니다.
      // 먼저 항목을 찾고 업데이트해야 합니다.
      const stocks = await this.find(filter);
      if (stocks.length === 0) {
        return false;
      }

      const stockId = stocks[0]._id;
      await this.findOneAndUpdate(stockId, update);
      return true;
    } catch (error) {
      console.error('Error updating stock', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteMany(filter: Record<string, any>): Promise<boolean> {
    try {
      const stocks = await this.find(filter);
      const deletionPromises = stocks.map((stock) => {
        const command = new DeleteCommand({
          Key: { _id: stock._id },
          TableName: STOCK_TABLE_NAME,
        });
        return this.dynamoDBClient.send(command);
      });

      await Promise.all(deletionPromises);
      return true;
    } catch (error) {
      console.error('Error deleting stocks', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  private buildFilterExpression(filter?: Record<string, any>) {
    if (!filter || Object.keys(filter).length === 0) {
      return {};
    }

    let filterExpression = '';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.entries(filter).forEach(([key, value], index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;

      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = value;

      filterExpression += filterExpression ? ` AND ${attrName} = ${attrValue}` : `${attrName} = ${attrValue}`;
    });

    return {
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
    };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private buildUpdateExpression(update: Partial<Stock>) {
    let updateExpression = 'SET ';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.entries(update).forEach(([key, value], index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;

      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = value;

      updateExpression += index > 0 ? `, ${attrName} = ${attrValue}` : `${attrName} = ${attrValue}`;
    });

    return {
      expressionAttributeNames,
      expressionAttributeValues,
      updateExpression,
    };
  }
}
