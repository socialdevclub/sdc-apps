import { HttpException, Injectable, Inject } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { StockConfig } from 'shared~config';
import { StockStorageSchema, StockUserSchema } from 'shared~type-stock';
import dayjs from 'dayjs';
import { StockUser } from './user.schema';

const STOCK_USER_TABLE_NAME = 'sdc-stock-user';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DYNAMODB_CLIENT')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async create(user: StockUser): Promise<void> {
    try {
      // DynamoDB에서는 트랜잭션을 별도로 처리
      const existingUser = await this.findOne({ stockId: user.stockId, userId: user.userId });

      if (!existingUser) {
        const newStockUser = new StockUser(user, user);

        const command = new PutCommand({
          Item: newStockUser,
          TableName: STOCK_USER_TABLE_NAME,
        });

        await this.dynamoDBClient.send(command);
      }
    } catch (err) {
      console.error(err);
      throw new HttpException('POST /stock/user/register Unknown Error', 500, { cause: err });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async count(filter: Record<string, any>): Promise<number> {
    try {
      const { stockId } = filter;

      if (stockId) {
        // stockId로 쿼리 수행 (파티션 키 사용)
        const command = new QueryCommand({
          ExpressionAttributeValues: {
            ':stockId': stockId,
          },
          KeyConditionExpression: 'stockId = :stockId',
          Select: 'COUNT',
          TableName: STOCK_USER_TABLE_NAME,
        });

        const { Count } = await this.dynamoDBClient.send(command);
        return Count || 0;
      }
      // 전체 스캔이 필요한 경우
      const command = new ScanCommand({
        TableName: STOCK_USER_TABLE_NAME,
        ...this.buildFilterExpression(filter),
        Select: 'COUNT',
      });

      const { Count } = await this.dynamoDBClient.send(command);
      return Count || 0;
    } catch (error) {
      console.error('Error counting users', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async find(filter?: Record<string, any>): Promise<StockUserSchema[]> {
    try {
      const { stockId } = filter || {};

      if (stockId) {
        // stockId로 쿼리 수행 (파티션 키 사용)
        const command = new QueryCommand({
          ExpressionAttributeValues: {
            ':stockId': stockId,
          },
          KeyConditionExpression: 'stockId = :stockId',
          TableName: STOCK_USER_TABLE_NAME,
        });

        const { Items } = await this.dynamoDBClient.send(command);
        return (Items || []) as StockUserSchema[];
      }
      // 전체 스캔이 필요한 경우
      const command = new ScanCommand({
        TableName: STOCK_USER_TABLE_NAME,
        ...this.buildFilterExpression(filter),
      });

      const { Items } = await this.dynamoDBClient.send(command);
      return (Items || []) as StockUserSchema[];
    } catch (error) {
      console.error('Error finding users', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(filter: Record<string, any>): Promise<StockUserSchema | null> {
    try {
      const { stockId, userId } = filter;

      if (stockId && userId) {
        // 기본 키(stockId, userId)로 조회
        const command = new GetCommand({
          Key: {
            stockId,
            userId,
          },
          TableName: STOCK_USER_TABLE_NAME,
        });

        const { Item } = await this.dynamoDBClient.send(command);
        return Item as StockUserSchema;
      }
      // 다른 속성으로 조회
      const items = await this.find(filter);
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error('Error finding user', error);
      throw error;
    }
  }

  async findOneAndUpdate(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: Record<string, any>,
    update: Partial<StockUserSchema>,
  ): Promise<StockUserSchema | null> {
    try {
      const { stockId, userId } = filter;

      if (!stockId || !userId) {
        throw new Error('stockId and userId must be provided for update');
      }

      const { updateExpression, expressionAttributeValues, expressionAttributeNames } =
        this.buildUpdateExpression(update);

      const command = new UpdateCommand({
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        Key: {
          stockId,
          userId,
        },
        ReturnValues: 'ALL_NEW',
        TableName: STOCK_USER_TABLE_NAME,
        UpdateExpression: updateExpression,
      });

      const { Attributes } = await this.dynamoDBClient.send(command);
      return Attributes as StockUserSchema;
    } catch (error) {
      console.error('Error updating user', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteOne(filter: Record<string, any>): Promise<boolean> {
    try {
      const { stockId, userId } = filter;

      if (!stockId || !userId) {
        throw new Error('stockId and userId must be provided for deletion');
      }

      const command = new DeleteCommand({
        Key: {
          stockId,
          userId,
        },
        TableName: STOCK_USER_TABLE_NAME,
      });

      await this.dynamoDBClient.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting user', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteMany(filter: Record<string, any>): Promise<boolean> {
    try {
      const users = await this.find(filter);
      const deletionPromises = users.map((user) => {
        const command = new DeleteCommand({
          Key: {
            stockId: user.stockId,
            userId: user.userId,
          },
          TableName: STOCK_USER_TABLE_NAME,
        });
        return this.dynamoDBClient.send(command);
      });

      await Promise.all(deletionPromises);
      return true;
    } catch (error) {
      console.error('Error deleting multiple users', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateOne(filter: Record<string, any>, update: Partial<StockUserSchema>): Promise<boolean> {
    try {
      const user = await this.findOne(filter);
      if (!user) {
        return false;
      }

      await this.findOneAndUpdate({ stockId: user.stockId, userId: user.userId }, update);
      return true;
    } catch (error) {
      console.error('Error updating user', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateMany(filter: Record<string, any>, update: Partial<StockUserSchema>): Promise<boolean> {
    try {
      const users = await this.find(filter);
      const updatePromises = users.map((user) => {
        return this.findOneAndUpdate({ stockId: user.stockId, userId: user.userId }, update);
      });

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Error updating multiple users', error);
      throw error;
    }
  }

  async initializeUsers(stockId: string): Promise<boolean> {
    try {
      const companies = StockConfig.getRandomCompanyNames();
      const stockStorages = companies.map((company) => {
        return {
          companyName: company,
          stockCountCurrent: 0,
          stockCountHistory: new Array(StockConfig.MAX_STOCK_IDX + 1).fill(0),
        } as StockStorageSchema;
      });

      const users = await this.find({ stockId });
      const updatePromises = users.map((user) => {
        return this.findOneAndUpdate(
          { stockId: user.stockId, userId: user.userId },
          {
            lastActivityTime: dayjs().toISOString(),
            money: StockConfig.INIT_USER_MONEY,
            resultByRound: [...(user.resultByRound ?? [])],
            stockStorages,
          },
        );
      });

      await Promise.all(updatePromises);
      return true;
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async countDocuments(filter: Record<string, any>): Promise<number> {
    return this.count(filter);
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
  private buildUpdateExpression(update: Partial<StockUserSchema>) {
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
