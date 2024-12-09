import { PollOmited, PollSchemaWithId, PollUserSchema, PollVoteForm } from '.';

export type PostAddVotes = {
  pollId: string;

  authorId?: string;

  votes: PollVoteForm[];
};

export type PatchToggleVotes = {
  pollId: string;

  user: PollUserSchema;

  joinVoteTitles?: string[];

  exitVoteTitles?: string[];
};

export type DeletePolls = {
  pollIds: string[];

  authorId?: string;
};

export type DeleteVotes = {
  pollId: string;

  authorId?: string;

  voteIds: string[];
};

export type PatchPoll = Partial<Omit<PollSchemaWithId, PollOmited>>;
