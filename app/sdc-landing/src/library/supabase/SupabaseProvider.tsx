import React, { useEffect, useState, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { SupabaseStore } from '../../store';
import { supabase } from '.';

interface Props {
  children: React.ReactNode;
}

const SupabaseProvider = ({ children }: Props) => {
  const setSupabaseSession = useSetAtom(SupabaseStore.supabaseSession);
  const setIsShouldPasswordRecovery = useSetAtom(SupabaseStore.isShouldPasswordRecovery);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 세션 갱신 함수
  const refreshSession = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('세션 갱신 실패:', error);
        return false;
      }

      setSupabaseSession(data.session);
      return true;
    } catch (error) {
      console.error('세션 갱신 중 오류 발생:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [setSupabaseSession]);

  // 세션 만료 확인 및 갱신 함수
  const checkAndRefreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const { session } = data;

    if (!session) {
      console.log('세션이 없습니다.');
      return;
    }

    // 현재 시간 (초 단위)
    const now = Math.floor(Date.now() / 1000);
    // 세션 만료 시간 (초 단위)
    const expiresAt = session.expires_at || 0; // 기본값 설정
    // 만료 5분 전에 갱신 시작 (300초 = 5분)
    const shouldRefresh = expiresAt - now < 300;

    if (shouldRefresh && !isRefreshing) {
      await refreshSession();
    }
  }, [refreshSession, isRefreshing]);

  useEffect(() => {
    // 초기 세션 로드
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);

      // 세션이 있는 경우 즉시 만료 여부 확인
      if (session) {
        checkAndRefreshSession();
      }
    });

    // 인증 상태 변경 이벤트 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsShouldPasswordRecovery(true);
      }

      // TOKEN_REFRESHED 이벤트 처리
      if (event === 'TOKEN_REFRESHED') {
        console.log('토큰이 갱신되었습니다.');
      }

      // SIGNED_OUT 이벤트 처리
      if (event === 'SIGNED_OUT') {
        console.log('로그아웃되었습니다.');
      }
    });

    // 정기적으로 세션 상태 확인 (1분마다)
    const intervalId = setInterval(() => {
      checkAndRefreshSession();
    }, 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [setIsShouldPasswordRecovery, setSupabaseSession, checkAndRefreshSession]);

  return <>{children}</>;
};

export default SupabaseProvider;
