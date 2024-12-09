import React from 'react';
import { QueryClient, QueryClientProvider as QueryClientProviderBase, defaultContext } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import useInitQueryClient from './hook/useInitQueryClient';
import Suspense from './Suspense';

interface QueryClientProviderProps {
  client?: QueryClient;
  devtoolEnabled?: boolean;
  children: React.ReactNode;
}

const QueryClientProvider = ({ client: queryClient, devtoolEnabled, children }: QueryClientProviderProps) => {
  const client = useInitQueryClient({
    queryClient,
  });

  return (
    <QueryClientProviderBase client={client}>
      <Suspense>{children}</Suspense>
      {devtoolEnabled && <ReactQueryDevtools context={defaultContext} />}
    </QueryClientProviderBase>
  );
};

export default QueryClientProvider;
