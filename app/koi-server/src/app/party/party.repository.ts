import { Injectable, Inject } from '@nestjs/common';
import { Request } from 'shared~type-party';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomInt } from 'crypto';
import { Party } from './schema/party.schema';

const PARTY_TABLE_NAME = 'sdc-party';

@Injectable()
export class PartyRepository {
  constructor(
    @Inject('DYNAMODB_CLIENT')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async findById(partyId: string): Promise<Party | null> {
    try {
      const command = new GetCommand({
        Key: { _id: partyId },
        TableName: PARTY_TABLE_NAME,
      });

      const { Item } = await this.dynamoDBClient.send(command);
      if (!Item) return null;

      return Item as Party;
    } catch (error) {
      console.error('Error getting party by id', error);
      throw error;
    }
  }

  async find(filter?: Record<string, unknown>): Promise<Party[]> {
    try {
      const command = new ScanCommand({
        TableName: PARTY_TABLE_NAME,
        ...this.buildFilterExpression(filter),
      });

      const { Items } = await this.dynamoDBClient.send(command);
      return (Items || []) as Party[];
    } catch (error) {
      console.error('Error scanning parties', error);
      throw error;
    }
  }

  async create(party: Party): Promise<Party> {
    try {
      // ID가 중복되지 않을 때까지 반복
      let isUnique = false;
      let _id = '';

      while (!isUnique) {
        // 100000부터 999999까지의 6자리 랜덤 숫자 생성
        _id = `${randomInt(1000000)}`.padStart(6, '0');

        // 중복 체크
        const command = new GetCommand({
          Key: { _id },
          TableName: PARTY_TABLE_NAME,
        });

        const { Item } = await this.dynamoDBClient.send(command);

        // 기존 항목이 없으면 고유한 ID
        if (!Item) {
          isUnique = true;
        } else {
          console.log(`ID ${_id} 중복, 새 ID 생성 시도...`);
        }
      }

      const newParty = { ...new Party(party, party), _id };

      const command = new PutCommand({
        Item: newParty,
        TableName: PARTY_TABLE_NAME,
      });

      await this.dynamoDBClient.send(command);
      return newParty;
    } catch (error) {
      console.error('Error creating party', error);
      throw error;
    }
  }

  async updateOne(party: Request.PatchParty): Promise<boolean> {
    try {
      const { updateExpression, expressionAttributeValues, expressionAttributeNames } =
        this.buildUpdateExpression(party);

      const command = new UpdateCommand({
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        Key: { _id: party._id },
        ReturnValues: 'ALL_NEW',
        TableName: PARTY_TABLE_NAME,
        UpdateExpression: updateExpression,
      });

      await this.dynamoDBClient.send(command);
      return true;
    } catch (error) {
      console.error('Error updating party', error);
      throw error;
    }
  }

  async deleteOne(partyId: string): Promise<boolean> {
    try {
      const command = new DeleteCommand({
        Key: { _id: partyId },
        TableName: PARTY_TABLE_NAME,
      });

      await this.dynamoDBClient.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting party', error);
      throw error;
    }
  }

  async joinParty(partyId: string, userId: string): Promise<Party | null> {
    try {
      const party = await this.findById(partyId);
      if (!party) return null;

      const joinedUserIds = [...new Set([...party.joinedUserIds, userId])];

      const command = new UpdateCommand({
        ExpressionAttributeNames: { '#joinedUserIds': 'joinedUserIds' },
        ExpressionAttributeValues: { ':joinedUserIds': joinedUserIds },
        Key: { _id: partyId },
        ReturnValues: 'ALL_NEW',
        TableName: PARTY_TABLE_NAME,
        UpdateExpression: 'SET #joinedUserIds = :joinedUserIds',
      });

      const { Attributes } = await this.dynamoDBClient.send(command);
      if (!Attributes) return null;

      return Attributes as Party;
    } catch (error) {
      console.error('Error joining party', error);
      throw error;
    }
  }

  async leaveParty(partyId: string, userId: string): Promise<Party | null> {
    try {
      const party = await this.findById(partyId);
      if (!party) return null;

      const joinedUserIds = party.joinedUserIds.filter((id) => id !== userId);

      const command = new UpdateCommand({
        ExpressionAttributeNames: { '#joinedUserIds': 'joinedUserIds' },
        ExpressionAttributeValues: { ':joinedUserIds': joinedUserIds },
        Key: { _id: partyId },
        ReturnValues: 'ALL_NEW',
        TableName: PARTY_TABLE_NAME,
        UpdateExpression: 'SET #joinedUserIds = :joinedUserIds',
      });

      const { Attributes } = await this.dynamoDBClient.send(command);
      if (!Attributes) return null;

      return Attributes as Party;
    } catch (error) {
      console.error('Error leaving party', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private buildFilterExpression(filter?: Record<string, unknown>) {
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
  private buildUpdateExpression(update: Partial<Party>) {
    let updateExpression = 'SET ';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.entries(update).forEach(([key, value], index) => {
      if (key === '_id') return; // _id는 업데이트 대상에서 제외

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
