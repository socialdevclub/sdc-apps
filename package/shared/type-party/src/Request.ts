import type { PartyOmited, PartySchemaWithId } from '.';

export type PatchParty = Partial<Omit<PartySchemaWithId, PartyOmited>>;

export type PostJoinParty = {
  partyId: string;
  userId: string;
};

export type PostLeaveParty = {
  partyId: string;
  userId: string;
};
