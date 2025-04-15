// message와 status를 받아서 생성

export default class QueryError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}
