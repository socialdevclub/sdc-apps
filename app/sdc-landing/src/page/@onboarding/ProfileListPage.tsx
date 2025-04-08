import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Query } from '../../hook';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 20px;
  background-color: #121212;
  color: white;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 10px;
  color: white;
  text-align: center;
`;

const Subtitle = styled.h2`
  font-size: 16px;
  margin-bottom: 30px;
  color: #bbb;
  text-align: center;
`;

const ProfileCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
`;

const ProfileCard = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
`;

const Avatar = styled.div<{ imageUrl?: string }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #2e2e2e;
  background-image: ${(props) => (props.imageUrl ? `url(${props.imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  border: 4px solid #444;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarPlaceholder = styled.div`
  font-size: 30px;
  color: #666;
`;

const UserName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 8px;
`;

const IntroducePreview = styled.div`
  color: #bbb;
  line-height: 1.6;
  height: 4.8em; /* 정확히 3줄 (1.6em * 3) */
  overflow: hidden;
  position: relative;
  background-color: #2a2a2a;
  padding: 12px;
  border-radius: 8px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 1.6em;
    background: linear-gradient(to bottom, rgba(42, 42, 42, 0), rgba(42, 42, 42, 1));
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 10px;
`;

const PageButton = styled.button<{ isActive?: boolean }>`
  background-color: ${(props) => (props.isActive ? '#5865f2' : '#2a2a2a')};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.isActive ? '#4752c4' : '#3a3a3a')};
  }

  &:disabled {
    background-color: #2a2a2a;
    color: #666;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #1e1e1e;
  border-radius: 15px;
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
`;

const EmptyStateText = styled.p`
  color: #bbb;
  font-size: 18px;
  text-align: center;
  margin: 20px 0;
`;

const ProfileListPage = () => {
  // queryString에서 page 값 가져오기
  const [searchParams] = useSearchParams();
  const pageNumber = Number(searchParams.get('page') ?? 0);
  const navigate = useNavigate();

  const { data, isLoading } = Query.Supabase.useQueryProfiles({ page: pageNumber });

  // 페이지 이동 핸들러
  const handlePageChange = (newPage: number) => {
    navigate(`/onboarding/profile?page=${newPage}`);
  };

  // 프로필 카드 클릭 핸들러
  const handleProfileClick = (username: string) => {
    navigate(`/onboarding/profile/view/${username}`);
  };

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <ProfileContainer>
        <Title>프로필 로딩 중...</Title>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Title>멤버 프로필</Title>
      <Subtitle>소셜데브클럽 멤버들의 프로필을 확인해보세요</Subtitle>

      {data && data.length > 0 ? (
        <>
          <ProfileCardsContainer>
            {data.map((profile) => (
              <ProfileCard key={profile.id} onClick={() => handleProfileClick(profile.username)}>
                <AvatarContainer>
                  {profile.avatar_url ? (
                    <Avatar imageUrl={profile.avatar_url} />
                  ) : (
                    <Avatar>
                      <AvatarPlaceholder>
                        {profile.username ? profile.username.charAt(0).toUpperCase() : '?'}
                      </AvatarPlaceholder>
                    </Avatar>
                  )}
                  <UserName>{profile.username || '이름 없음'}</UserName>
                </AvatarContainer>
                <IntroducePreview>{profile.introduce || '자기소개가 없습니다.'}</IntroducePreview>
              </ProfileCard>
            ))}
          </ProfileCardsContainer>

          <Pagination>
            <PageButton disabled={pageNumber === 0} onClick={() => handlePageChange(pageNumber - 1)}>
              이전
            </PageButton>
            <PageButton isActive>{pageNumber + 1}</PageButton>
            <PageButton onClick={() => handlePageChange(pageNumber + 1)}>다음</PageButton>
          </Pagination>
        </>
      ) : (
        <>
          <EmptyState>
            <EmptyStateText>아직 프로필이 없습니다.</EmptyStateText>
          </EmptyState>
          <Pagination>
            <PageButton disabled={pageNumber === 0} onClick={() => handlePageChange(pageNumber - 1)}>
              이전
            </PageButton>
            <PageButton isActive>{pageNumber + 1}</PageButton>
            <PageButton disabled>다음</PageButton>
          </Pagination>
        </>
      )}
    </ProfileContainer>
  );
};

export default ProfileListPage;
