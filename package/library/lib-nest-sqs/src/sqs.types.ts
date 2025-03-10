export interface SqsMessage<T = unknown> {
  id: string;
  action: string;
  data: T;
  timestamp: string;
}

export interface SqsOptions {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  queueUrl?: string;
}

export interface SqsModuleOptions {
  isGlobal?: boolean;
  options: SqsOptions;
}
