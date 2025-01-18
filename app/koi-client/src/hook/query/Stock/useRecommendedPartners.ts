import { useAtomValue } from 'jotai';
import { objectEntries } from '@toss/utils';
import { useMemo } from 'react';
import { Query } from '../..';
import { UserStore } from '../../../store';

export const useRecommendedPartners = (stockId: string | undefined): { partnerNicknames: string[] } => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users?.map((v) => v.userId) ?? []);

  const partnerNicknames = useMemo(() => {
    if (!stock || !userId || !profiles?.data) return [];

    const [partnerIds] = objectEntries(stock.companies).reduce(
      (reducer, [_, companyInfos]) => {
        const [partnerIds] = reducer;

        companyInfos.forEach((_, idx) => {
          if (companyInfos[idx].정보.some((name) => name === userId)) {
            const partners = companyInfos[idx].정보.filter((name) => name !== userId);
            partners.forEach((partner) => {
              if (partner && !partnerIds.some((v) => v === partner)) {
                partnerIds.push(partner);
              }
            });
          }
        });

        return reducer;
      },
      [[], []] as [Array<string>, Array<{ company: string; timeIdx: number; price: number }>],
    );

    return profiles.data
      .map((v) => {
        if (partnerIds.some((partnerId) => partnerId === v.id)) {
          return v.username;
        }
        return undefined;
      })
      .filter((v): v is string => !!v);
  }, [stock, userId, profiles]);

  return { partnerNicknames };
};
