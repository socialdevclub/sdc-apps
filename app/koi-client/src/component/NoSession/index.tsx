import React from 'react';
import { SwitchCase } from '@toss/react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Auth } from '../../library/supabase/auth';
import MobileLayout from '../../component-presentation/MobileLayout';
import Splash from './Splash';
import { supabase } from '../../library/supabase';
import authLocalization from '../../library/supabase/authLocalization';
import EmptyProvider from '../../component-presentation/EmptyProvider';

const NoSession = () => {
  const [route, setRoute] = React.useState('SPLASH');
  const handleRouteChange = (newRoute: string) => {
    setRoute(newRoute);
  };

  return (
    <SwitchCase
      value={route}
      caseBy={{
        AUTH: (
          <MobileLayout ScrollViewComponent={EmptyProvider} backgroundColor="#f2f2f2">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              localization={authLocalization}
              redirectTo={window.location.origin}
              route={route}
              handleRouteChange={handleRouteChange}
            />
          </MobileLayout>
        ),
        SPLASH: (
          <MobileLayout backgroundColor="#00000000" ScrollViewComponent={EmptyProvider}>
            <Splash onAuthDetail={() => setRoute('AUTH')} />
          </MobileLayout>
        ),
      }}
    />
  );
};

export default NoSession;
