import React, { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { SupabaseStore } from '../../store';
import { supabase } from '.';

interface Props {
  children: React.ReactNode;
}

const SupabaseProvider = ({ children }: Props) => {
  const setSupabaseSession = useSetAtom(SupabaseStore.supabaseSession);
  const setIsShouldPasswordRecovery = useSetAtom(SupabaseStore.isShouldPasswordRecovery);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsShouldPasswordRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [setIsShouldPasswordRecovery, setSupabaseSession]);

  return <>{children}</>;
};

export default SupabaseProvider;
