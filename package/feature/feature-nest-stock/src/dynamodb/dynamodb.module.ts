import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { dynamoDBConfig } from '../config/dynamodb.config';

@Module({
  exports: ['DYNAMODB_CLIENT'],
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useFactory: (): DynamoDBDocumentClient => {
        const client = new DynamoDBClient(dynamoDBConfig);
        return DynamoDBDocumentClient.from(client, {
          marshallOptions: {
            convertClassInstanceToMap: true,
            removeUndefinedValues: true,
          },
        });
      },
    },
  ],
})
export class DynamoDBModule {}
