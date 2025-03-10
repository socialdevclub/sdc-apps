import { Provider, SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { I18nVariables, ProviderScopes, SocialLayout, template } from '@supabase/auth-ui-shared';
import { Appearance } from '../../../types';
import { Button, Container } from '../../UI/index.js';
import { Icons } from '../Icons.js';

interface SocialAuthProps {
  supabaseClient: SupabaseClient;
  socialLayout?: SocialLayout;
  providers?: Provider[];
  providerScopes?: Partial<ProviderScopes>;
  queryParams?: { [key: string]: string };
  redirectTo?: RedirectTo;
  onlyThirdPartyProviders?: boolean;
  view?: 'sign_in' | 'sign_up' | 'magic_link';
  i18n?: I18nVariables;
  appearance?: Appearance;
}

type RedirectTo = undefined | string;

function SocialAuth({
  supabaseClient,
  socialLayout = 'vertical',
  providers = ['github', 'google', 'azure'],
  providerScopes,
  queryParams,
  redirectTo,
  onlyThirdPartyProviders = true,
  view = 'sign_in',
  i18n,
  appearance,
}: SocialAuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verticalSocialLayout = socialLayout === 'vertical';

  const currentView = view === 'magic_link' ? 'sign_in' : view;

  const handleProviderSignIn = async (provider: Provider) => {
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      options: {
        queryParams,
        redirectTo,
        scopes: providerScopes?.[provider],
      },
      provider,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  function handleProviderNameEdgeCases(provider: string) {
    if (provider === 'linkedin_oidc') {
      return 'LinkedIn';
    }
    return provider;
  }

  function capitalize(word: string) {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
  }

  function getButtonColor(provider: Provider) {
    if (provider === 'discord') return 'discord';
    return 'default';
  }

  return (
    <>
      {providers && providers.length > 0 && (
        <>
          <Container gap="large" direction="vertical" appearance={appearance}>
            <Container
              direction={verticalSocialLayout ? 'vertical' : 'horizontal'}
              gap={verticalSocialLayout ? 'small' : 'medium'}
              appearance={appearance}
            >
              {providers.map((provider: Provider) => {
                return (
                  <Button
                    key={provider}
                    color={getButtonColor(provider)}
                    loading={loading}
                    onClick={() => handleProviderSignIn(provider)}
                    appearance={appearance}
                  >
                    <Icons provider={provider} />
                    {verticalSocialLayout &&
                      template(i18n?.[currentView]?.social_provider_text as string, {
                        provider: capitalize(handleProviderNameEdgeCases(provider)),
                      })}
                  </Button>
                );
              })}
            </Container>
          </Container>
        </>
      )}
    </>
  );
}

export { SocialAuth };
