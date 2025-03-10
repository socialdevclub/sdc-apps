import React from 'react';
import styled from '@emotion/styled';
import { Query } from '../../hook';
import { fetchProfileByUsername } from '../../hook/query/Supabase/useQueryProfileByUsername';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserListProps {
  stockId: string;
}

const UserList: React.FC<UserListProps> = ({ stockId }) => {
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));

  const introNotCompletedUsers = users.filter((user) => !user.userInfo.introduction);

  const { mutateAsync: mutateRemoveUser } = Query.Stock.useRemoveUser();
  const { mutateAsync: mutateRegisterUser } = Query.Stock.useRegisterUser();

  return (
    <UserListContainer>
      <StyledInput
        placeholder="등록할 유저 닉네임"
        onKeyDown={async (event) => {
          if (event.key === 'Enter' && event.currentTarget.value) {
            const username = event.currentTarget.value;

            if (users.find((v) => v.userInfo.nickname === username)) {
              alert('이미 참가자입니다.');
              return;
            }

            const profile = await fetchProfileByUsername([username]);

            if (!profile.data?.length) {
              alert('존재하지 않는 유저입니다.');
              return;
            }

            if (profile.data.length > 1) {
              alert('중복된 유저입니다.');
              return;
            }

            const profileData = profile.data[0];

            mutateRegisterUser({
              stockId,
              userId: profileData.id,
              userInfo: {
                gender: profileData.gender,
                nickname: profileData.username,
              },
            });
          }
        }}
      />

      <UserStats>
        <StatItem>
          <StatLabel>참가자</StatLabel>
          <StatValue>{users?.length}명</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>자기소개 미완료</StatLabel>
          <StatValue>{introNotCompletedUsers.length}명</StatValue>
        </StatItem>
      </UserStats>

      <UserGridContainer>
        {users?.map((user) => (
          <UserCard key={user.userId}>
            <UserCardContent>
              <UserName>{profiles?.data?.find((v) => v.id === user.userId)?.username || '사용자'}</UserName>
              {!user.userInfo.introduction && <MissingIntro>자기소개 미작성</MissingIntro>}
            </UserCardContent>
            <RemoveButton
              onClick={() => {
                mutateRemoveUser({ stockId, userId: user.userId });
              }}
            >
              제거
            </RemoveButton>
          </UserCard>
        ))}
      </UserGridContainer>

      {introNotCompletedUsers.length > 0 && (
        <WarningSection>
          <WarningTitle>자기소개 미완료 사용자</WarningTitle>
          <WarningList>
            {introNotCompletedUsers.map((user) => (
              <WarningItem key={user.userId}>
                {profiles?.data?.find((v) => v.id === user.userId)?.username || '사용자'}
              </WarningItem>
            ))}
          </WarningList>
        </WarningSection>
      )}
    </UserListContainer>
  );
};

export default UserList;

// 스타일 컴포넌트
const UserListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const StyledInput = styled.input`
  padding: 0.6rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #3f51b5;
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const UserStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f5f5f5;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: #666;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: #3f51b5;
`;

const UserGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.8rem;
`;

const UserCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3f51b5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const UserCardContent = styled.div`
  padding: 0.7rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MissingIntro = styled.div`
  font-size: 0.7rem;
  background-color: #ffebee;
  color: #f44336;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  display: inline-block;
`;

const RemoveButton = styled.button`
  width: 100%;
  padding: 0.4rem;
  font-size: 0.8rem;
  background-color: #f5f5f5;
  border: none;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ffebee;
    color: #f44336;
  }
`;

const WarningSection = styled.div`
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 4px;
`;

const WarningTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #ff8f00;
  margin-bottom: 0.5rem;
`;

const WarningList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const WarningItem = styled.div`
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  background-color: #fff;
  border: 1px solid #ffe082;
  border-radius: 4px;
  color: #ff8f00;
`;
