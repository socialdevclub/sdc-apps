import React from 'react';
import { Query } from '../../hook';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserListProps {
  stockId: string;
}

const UserList: React.FC<UserListProps> = ({ stockId }) => {
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));

  const introNotCompletedUsers = users.filter((user) => !user.userInfo.introduction);

  const { mutateAsync: mutateRemoveUser } = Query.Stock.useRemoveUser();

  return (
    <>
      <table>
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
        <tr>
          <td>자기소개 미완료 {introNotCompletedUsers.length}명</td>
          <td>
            {introNotCompletedUsers.map((user) => (
              <div key={user.userId}>{profiles?.data?.find((v) => v.id === user.userId)?.username}</div>
            ))}
          </td>
        </tr>
      </table>
    </>
  );
};

export default UserList;
