import { SwitchCase } from '@toss/react';
import { useAtomValue } from 'jotai';
import ProfileSetter from './ProfileSetter';
import Waiting from './Waiting';
import AccessDenided from './AccessDenided';
import Stock from './Stock';
import Result from './Result';
import { Query } from '../../../../../hook';
import { UserStore } from '../../../../../store';

interface Props {
  stockId: string;
}

const Phase = ({ stockId }: Props) => {
  const { stockPhase } = Query.Stock.useQueryStockPhase(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);

  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const isEntry = users?.some((user) => user.userId === supabaseSession?.user.id);

  if (!supabaseSession || !stockPhase) {
    return <></>;
  }

  if (!isEntry && stockPhase !== 'CROWDING') {
    return <AccessDenided />;
  }

  return (
    <>
      <SwitchCase
        value={stockPhase}
        caseBy={{
          CROWDING: isEntry ? <Waiting /> : <ProfileSetter stockId={stockId} userId={supabaseSession?.user.id} />,
          PLAYING: <Stock stockId={stockId} />,
          RESULT: <Result stockId={stockId} />,
          WAITING: <Waiting />,
        }}
        defaultComponent={<Waiting />}
      />
    </>
  );
};

export default Phase;
