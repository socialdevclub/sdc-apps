import { useEffect } from 'react';
import { Query } from '../../../../../hook';

interface Props {
  stockId: string;
  userId: string;
}

const ProfileSetter = ({ userId, stockId }: Props) => {
  const { mutateAsync } = Query.Stock.useSetUser();

  useEffect(() => {
    mutateAsync({ inventory: {}, lastActivityTime: new Date(), money: 1000000, stockId, userId });
  }, [mutateAsync, stockId, userId]);

  return <></>;
};

export default ProfileSetter;
