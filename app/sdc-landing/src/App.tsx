import { QueryClientProvider } from 'lib-react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import Home from './page/@';
import SupabaseProvider from './library/supabase/SupabaseProvider';
import OnboardingLoginPage from './page/@onboarding/OnboardingLoginPage';
import ProfileEditPage from './page/@onboarding/ProfileEditPage';
import OnboardingPage from './page/@onboarding/OnboardingPage';

const router = createBrowserRouter([
  {
    element: <Home />,
    path: '/',
  },
  {
    element: <OnboardingPage />,
    path: '/onboarding',
  },
  {
    element: <OnboardingLoginPage />,
    path: '/onboarding/login',
  },
  {
    element: <ProfileEditPage />,
    path: '/onboarding/profile',
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
