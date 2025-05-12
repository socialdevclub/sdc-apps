import React from 'react';
import styled from '@emotion/styled';

// 스타일 컴포넌트
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

const ProfileCard = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 30px;
  background-color: #1e1e1e;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
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

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
`;

const Avatar = styled.div<{ imageUrl?: string }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #2e2e2e;
  background-image: ${(props) => (props.imageUrl ? `url(${props.imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  border: 4px solid #444;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const AvatarPlaceholder = styled.div`
  font-size: 40px;
  color: #666;
`;

const InfoContainer = styled.div`
  width: 100%;
  margin-top: 15px;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  flex: 1;
  color: #999;
  font-weight: bold;
`;

const InfoValue = styled.span`
  flex: 2;
  color: white;
`;

const IntroduceContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #2a2a2a;
  border-radius: 10px;
`;

const IntroduceTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  color: #ddd;
`;

const IntroduceContent = styled.div`
  color: #bbb;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const EditButton = styled.button`
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  margin-top: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4752c4;
  }
`;

// 성별 표시 형식 변환
const getGenderDisplay = (gender: string) => {
  switch (gender) {
    case 'M':
      return '남성';
    case 'F':
      return '여성';
    default:
      return '미설정';
  }
};

export interface ProfileViewProps {
  isLoading: boolean;
  username: string;
  gender: string;
  avatarUrl: string;
  introduce: string;
  onEditProfile?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  isLoading,
  username,
  gender,
  avatarUrl,
  introduce,
  onEditProfile,
}) => {
  if (isLoading) {
    return (
      <ProfileContainer>
        <Title>프로필 로딩 중...</Title>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Title>{username}님의 프로필</Title>
      <Subtitle>{username}님의 프로필 정보입니다</Subtitle>

      <ProfileCard>
        <AvatarContainer>
          {avatarUrl ? (
            <Avatar imageUrl={avatarUrl} />
          ) : (
            <Avatar>
              <AvatarPlaceholder>{username ? username[0].toUpperCase() : '?'}</AvatarPlaceholder>
            </Avatar>
          )}
          <h2>{username || '이름 미설정'}</h2>
        </AvatarContainer>

        <InfoContainer>
          <InfoRow>
            <InfoLabel>성별</InfoLabel>
            <InfoValue>{getGenderDisplay(gender)}</InfoValue>
          </InfoRow>
        </InfoContainer>

        {introduce && (
          <IntroduceContainer>
            <IntroduceTitle>소개</IntroduceTitle>
            <IntroduceContent>{introduce}</IntroduceContent>
          </IntroduceContainer>
        )}

        {onEditProfile && <EditButton onClick={onEditProfile}>프로필 수정</EditButton>}
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfileView;
