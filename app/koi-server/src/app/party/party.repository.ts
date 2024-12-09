import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Request } from 'shared~type-party';
import { Party, PartyDocument } from './schema/party.schema';

@Injectable()
export class PartyRepository {
  constructor(
    @InjectModel(Party.name)
    private readonly partyModel: Model<Party>,
  ) {}

  findById(
    partyId: string,
    projection?: mongoose.ProjectionType<Party>,
    options?: mongoose.QueryOptions<Party>,
  ): Promise<PartyDocument> {
    return this.partyModel.findById(partyId, projection, options);
  }

  find(
    filter: mongoose.FilterQuery<Party>,
    projection?: mongoose.ProjectionType<Party>,
    options?: mongoose.QueryOptions<Party>,
  ): Promise<PartyDocument[]> {
    return this.partyModel.find(filter, projection, options);
  }

  create(party: Party): Promise<PartyDocument> {
    return this.partyModel.create(new Party(party, party));
  }

  async updateOne(party: Request.PatchParty): Promise<boolean> {
    return !!(await this.partyModel.updateOne(
      {
        _id: party._id,
      },
      {
        ...party,
      },
    ));
  }

  async deleteOne(partyId: string): Promise<boolean> {
    return !!(await this.partyModel.deleteOne({
      _id: partyId,
    }));
  }

  async joinParty(partyId: string, userId: string): Promise<PartyDocument> {
    return this.partyModel.findOneAndUpdate(
      {
        _id: partyId,
      },
      {
        $addToSet: {
          joinedUserIds: userId,
        },
      },
      {
        returnDocument: 'after',
      },
    );
  }

  async leaveParty(partyId: string, userId: string): Promise<PartyDocument> {
    return this.partyModel.findOneAndUpdate(
      {
        _id: partyId,
      },
      {
        $pull: {
          joinedUserIds: userId,
        },
      },
      {
        returnDocument: 'after',
      },
    );
  }
}
