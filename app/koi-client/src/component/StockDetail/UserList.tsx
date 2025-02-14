import React from 'react';
import { Query } from '../../hook';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserListProps {
  stockId: string;
}

const UserList: React.FC<UserListProps> = ({ stockId }) => {
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));

  const { mutateAsync: mutateRemoveUser } = Query.Stock.useRemoveUser();

  return (
    <>
      <table>
        <thead>
          <tr>
            <td>
              <div>참가자 {users?.length}명</div>
            </td>
            {users?.map((user) => (
              <td key={user.userId}>
                <button
                  onClick={() => {
                    mutateRemoveUser({ stockId, userId: user.userId });
                  }}
                >
                  {profiles?.data?.find((v) => v.id === user.userId)?.username}
                </button>
              </td>
            ))}
          </tr>
        </thead>
      </table>
    </>
  );
};

export default UserList;
