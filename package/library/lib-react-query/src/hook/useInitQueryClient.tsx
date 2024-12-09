import React from 'react';
import { QueryClient } from '@tanstack/react-query';

const useInitQueryClient = ({ queryClient }: { queryClient?: QueryClient }): QueryClient => {
  return React.useState(
    () =>
      queryClient ??
      new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: 1000 * 60 * 5,
            keepPreviousData: true,
            refetchInterval: false,
            refetchIntervalInBackground: true,
            refetchOnMount: 'always',
            refetchOnReconnect: 'always',
            refetchOnWindowFocus: 'always',
            retry: 3,
            retryOnMount: true,
            staleTime: 1000 * 60,
            suspense: true,
            useErrorBoundary: true,
          },
        },
      }),
  )[0];
};

export default useInitQueryClient;
