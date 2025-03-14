import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClientProvider } from 'lib-react-query';
import { useAtom } from 'jotai';
import Main from './page/@';
import SupabaseProvider from './library/supabase/SupabaseProvider';
import { UserStore } from './store';
import BackofficePoll from './page/@backoffice@poll';
import Profile from './page/@profile';
import Party from './page/@party@[partyId]';
import Backoffice from './page/@backoffice';
import BackofficeParty from './page/@backoffice@party';
import NoSession from './component/NoSession';
import BackofficeStock from './page/@backoffice@stock';
import BackofficeScreen from './page/@backoffice@screen@[partyId]';
import BackofficeStockDetail from './page/@backoffice@stock@[stockId]';
import BackofficePartyDetailPage from './page/@backoffice@party@[partyId]';

const router = createBrowserRouter([
  {
    element: <Main />,
    path: '/',
  },
  {
    element: <Party />,
    path: '/party/:partyId',
  },
  {
    element: <Profile />,
    path: '/profile',
  },
  {
    element: <Backoffice />,
    path: '/backoffice',
  },
  {
    element: <BackofficePoll />,
    path: '/backoffice/poll',
  },
  {
    element: <BackofficeParty />,
    path: '/backoffice/party',
  },
  {
    element: <BackofficePartyDetailPage />,
    path: '/backoffice/party/:partyId',
  },
  {
    element: <BackofficeStock />,
    path: '/backoffice/stock',
  },
  {
    element: <BackofficeStockDetail />,
    path: '/backoffice/stock/:stockId',
  },
  {
    element: <BackofficeScreen />,
    path: '/backoffice/screen/:partyId',
  },
]);

const Global: React.FC = () => {
  const [supabaseSession, setSupabaseSession] = useAtom(UserStore.supabaseSession);

  return (
    <QueryClientProvider devtoolEnabled>
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: '#1f2028',
              headerBg: '#1f2028',
              titleColor: '#ffffff',
              titleFontSize: 18,
              zIndexPopupBase: 999,
            },
          },
          token: {
            colorIcon: '#A2A2A2',
            colorIconHover: '#888888',
            fontFamily: 'DungGeunMo',
          },
        }}
      >
        <SupabaseProvider
          supabaseSession={supabaseSession}
          setSupabaseSession={setSupabaseSession}
          noSessionComponent={<NoSession />}
        >
          <RouterProvider router={router} />
        </SupabaseProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default Global;
