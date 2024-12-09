import { UseMutationOptions, UseMutationResult, useMutation as useMutationBase } from '@tanstack/react-query';

type UtilityRQOption<TData, TError, TVariables, TContext> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationFn'
>;

type Props<TData, TVariables> = {
  api: Api;
  reactQueryOption?: UtilityRQOption<TData, unknown, TVariables, unknown>;
};

type Api = {
  hostname?: string;
  pathname: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  signal?: AbortSignal;
};

const useMutation = <TVariables extends object, TData = unknown>({
  api,
  reactQueryOption,
}: Props<TData, TVariables>): UseMutationResult<TData, unknown, TVariables, unknown> => {
  const url = `${api.hostname}${api.pathname}`;

  return useMutationBase<TData, unknown, TVariables, unknown>(async (requestData) => {
    const res = await fetch(url, {
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json',
        ...api.headers,
      },
      keepalive: true,
      method: api.method,
      signal: api.signal,
    });

    const json = await res.json();

    if (!res.ok) {
      throw Error(`${json.message ?? '알 수 없는 오류가 발생하였습니다.'}`);
    }

    return json;
  }, reactQueryOption);
};

export default useMutation;
