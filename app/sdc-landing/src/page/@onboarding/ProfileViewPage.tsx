import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Query } from '../../hook';
import { supabase } from '../../library/supabase';

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

// 프로필 컴포넌트
const ProfileViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { username: usernameParam } = useParams<{ username?: string }>();

  // 디스코드 관련 데이터 가져오기
  const {
    nickname,
    isAuthenticated,
    isFetching: isDiscordLoading,
    data: discordData,
  } = Query.Supabase.Discord.useQuerySdcGuildUser();

  // Supabase 세션 가져오기
  const { data: session } = Query.Supabase.useGetSession();

  // 상태 관리
  const [username, setUsername] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [introduce, setIntroduce] = useState<string>('');
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [isOtherUser, setIsOtherUser] = useState<boolean>(false);

  // 프로필 데이터 로드
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let profileData;

        if (usernameParam) {
          // 특정 사용자 프로필 조회
          setIsOtherUser(true);
          const { data, error } = await supabase.from('profiles').select('*').eq('username', usernameParam).single();

          if (error) {
            console.error('프로필 데이터 로드 오류:', error);
            return;
          }

          profileData = data;
        } else if (session?.session?.user?.id) {
          // 현재 로그인한 사용자 프로필 조회
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.session.user.id)
            .single();

          if (error) {
            console.error('프로필 데이터 로드 오류:', error);
            return;
          }

          profileData = data;
        } else {
          return;
        }

        // 프로필 데이터 설정
        if (profileData) {
          setUsername(profileData.username || '');
          setGender(profileData.gender || '');
          setIntroduce(profileData.introduce || '');

          // 아바타 URL 설정
          if (profileData.avatar_url) {
            setAvatarUrl(profileData.avatar_url);
          }
        }

        setIsProfileLoading(false);
      } catch (err) {
        console.error('프로필 데이터 로드 중 오류 발생:', err);
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [session, usernameParam]);

  // 디스코드 아바타 URL 설정 - 자신의 프로필 볼 때만 적용
  useEffect(() => {
    if (!isOtherUser && discordData?.user?.id) {
      const discordId = discordData.user.id;
      const avatarId = discordData.user.avatar;

      if (avatarId) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatarId}.png`;
        setAvatarUrl(avatarUrl);
      }
    }
  }, [discordData, isOtherUser]);

  // 디스코드 연동 체크 및 리다이렉트
  useEffect(() => {
    if (!isDiscordLoading && !isAuthenticated) {
      navigate('/onboarding/login');
    }
  }, [isAuthenticated, isDiscordLoading, navigate]);

  // 프로필 편집 페이지로 이동
  const handleEditProfile = () => {
    navigate('/onboarding/profile/edit');
  };

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

  if (isProfileLoading) {
    return (
      <ProfileContainer>
        <Title>프로필 로딩 중...</Title>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Title>{isOtherUser ? `${username}님의 프로필` : '내 프로필'}</Title>
      <Subtitle>{isOtherUser ? `${username}님의 프로필 정보입니다` : '나의 프로필 정보를 확인해보세요'}</Subtitle>

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

        {!isOtherUser && <EditButton onClick={handleEditProfile}>프로필 수정</EditButton>}
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfileViewPage;
