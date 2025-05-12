import { UseQueryOptions, UseQueryResult, useQuery as useQueryBase } from '@tanstack/react-query';
import getQueryKey from '../service/getQueryKey';

type Props<TData> = {
  api: Api;
  reactQueryOption?: Omit<UseQueryOptions<TData, unknown, TData>, 'queryKey' | 'queryFn'>;
};

type Api = {
  /**
   * @deprecated Use `origin` instead
   */
  hostname?: string;
  /**
   * @default `window.location.origin`
   */
  origin?: string;
  pathname: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  signal?: AbortSignal;
  body?: object;
  /**
   * 에러가 나면 `error` 에 에러를 넣어준다.
   * @default false
   */
  triggerError?: boolean;
};

const useQuery = <TData = unknown>({ api, reactQueryOption }: Props<TData>): UseQueryResult<TData, unknown> => {
  const origin = api.origin ?? api.hostname ?? window.location.origin;
  const headers = {
    'Content-Type': 'application/json',
    ...api.headers,
  };
  const url = `${origin}${api.pathname}`;
  const body = JSON.stringify(api.body);

  return useQueryBase(
    getQueryKey({ body: api.body, method: api.method, origin, pathname: api.pathname }),
    async () => {
      const res = await fetch(url, {
        body,
        headers,
        keepalive: true,
        method: api.method,
        signal: api.signal,
      });

      return res.json();
    },
    reactQueryOption,
  );
};

export default useQuery;
