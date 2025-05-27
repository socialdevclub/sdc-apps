import { QueryClientProvider } from 'lib-react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import Home from './page/@';
import SupabaseProvider from './library/supabase/SupabaseProvider';
import OnboardingLoginPage from './page/@onboarding/OnboardingLoginPage';
import ProfileEditPage from './page/@onboarding/ProfileEditPage';
import OnboardingPage from './page/@onboarding/OnboardingPage';
import ProfileViewPage from './page/@onboarding/ProfileViewPage';
import ProfileListPage from './page/@onboarding/ProfileListPage';
import Layout from './common/Layout';

const router = createBrowserRouter([
  {
    children: [
      {
        element: <Home />,
        index: true,
      },
      {
        element: <OnboardingPage />,
        path: 'onboarding',
      },
      {
        element: <OnboardingLoginPage />,
        path: 'onboarding/login',
      },
      {
        element: <ProfileListPage />,
        path: 'onboarding/profile',
      },
      {
        element: <ProfileEditPage />,
        path: 'onboarding/profile/edit',
      },
      {
        element: <ProfileViewPage />,
        path: 'onboarding/profile/view',
      },
      {
        element: <ProfileViewPage />,
        path: 'onboarding/profile/view/:username',
      },
    ],
    element: <Layout />,
    path: '/',
  },
]);

function App() {
  return (
    <JotaiProvider>
      <QueryClientProvider devtoolEnabled>
        <SupabaseProvider>
          <RouterProvider router={router} />
        </SupabaseProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}

export default App;
