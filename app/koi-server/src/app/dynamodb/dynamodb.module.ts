import { Module, Global } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const PARTY_TABLE_NAME = 'sdc-party';

@Global()
@Module({
  exports: ['DYNAMODB_CLIENT'],
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useFactory: (): DynamoDBDocumentClient => {
        const client = new DynamoDBClient({ region: 'ap-northeast-2' });
        return DynamoDBDocumentClient.from(client, {
          marshallOptions: {
            convertClassInstanceToMap: false,
            removeUndefinedValues: true,
          },
        });
      },
    },
  ],
})
export class DynamoDBModule {}
