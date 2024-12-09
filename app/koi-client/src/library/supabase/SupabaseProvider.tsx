import React, { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '.';

interface Props {
  noSessionComponent?: React.ReactNode;
  supabaseSession: Session | null;
  setSupabaseSession: (session: Session | null) => void;
  children: React.ReactNode;
}

const SupabaseProvider = ({ noSessionComponent, supabaseSession, setSupabaseSession, children }: Props) => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSupabaseSession]);

  if (noSessionComponent && !supabaseSession) {
    return <>{noSessionComponent}</>;
  }

  return <>{children}</>;
};

export default SupabaseProvider;
