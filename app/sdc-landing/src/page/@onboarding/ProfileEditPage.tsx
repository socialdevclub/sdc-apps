import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Card = styled.div`
  width: 100%;
  max-width: 700px;
  padding: 30px;
  background-color: #1e1e1e;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 24px;
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
  margin-bottom: 20px;
`;

const Avatar = styled.div<{ imageUrl?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #2e2e2e;
  background-image: ${(props) => (props.imageUrl ? `url(${props.imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const AvatarPlaceholder = styled.div`
  font-size: 40px;
  color: #666;
`;

const Label = styled.span`
  color: white;
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
`;

const FooterText = styled.p`
  color: #999;
  font-size: 14px;
  margin-top: 20px;
  text-align: center;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const FormItem = styled.div`
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #2e2e2e;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  background-color: #2e2e2e;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const CharCount = styled.div<{ isExceeded: boolean }>`
  text-align: right;
  margin-top: 5px;
  font-size: 14px;
  color: ${(props) => (props.isExceeded ? '#e74c3c' : '#999')};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 15px;
  color: white;
  margin-top: 30px;
`;

const Question = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #ddd;
  word-break: keep-all;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const RadioInput = styled.input`
  cursor: pointer;
`;

const Button = styled.button<{ primary?: boolean; disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  background-color: ${(props) => (props.primary ? '#5865f2' : '#2e2e2e')};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? '#5865f2' : '#4752c4')};
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin: 10px 0;
  font-size: 14px;
`;

// 자기소개 질문 정보
const INTRODUCE_QUESTION = {
  id: 'introduce',
  maxLength: 2000,
  minLength: 200,
  placeholder:
    '예) 저는 개발자로 일하면서 항상 더 재미있는 서비스를 만들고 싶었어요. 소셜데브클럽에서 게임과 커뮤니티가 결합된 프로젝트를 함께할 수 있어 기대돼요!',
  question: '당신만의 특별한 이야기나 경험을 들려주세요. 소셜데브클럽에서 함께하게 된 계기도 궁금해요! (200~2000자)',
};

// 프로필 컴포넌트
const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();

  // 디스코드 관련 데이터 가져오기
  const {
    nickname,
    isJoined,
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
  const [error, setError] = useState<string>('');

  // 프로필 데이터 로드
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.session?.user?.id) return;

      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', session.session.user.id).single();

        if (error) {
          console.error('프로필 데이터 로드 오류:', error);
          return;
        }

        // 디스코드 닉네임이 있으면 우선 설정
        if (nickname) {
          setUsername(nickname);
        } else if (data?.username) {
          setUsername(data.username);
        }

        if (data?.gender) {
          setGender(data.gender);
        }

        if (data?.introduce) {
          setIntroduce(data.introduce);
        }

        setIsProfileLoading(false);
      } catch (err) {
        console.error('프로필 데이터 로드 중 오류 발생:', err);
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [session, nickname]);

  // 디스코드 아바타 URL 설정
  useEffect(() => {
    if (discordData?.user?.id) {
      const discordId = discordData.user.id;
      const avatarId = discordData.user.avatar;

      if (avatarId) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatarId}.png`;
        setAvatarUrl(avatarUrl);
      }
    }
  }, [discordData]);

  // 디스코드 연동 체크 및 리다이렉트
  useEffect(() => {
    if (!isDiscordLoading && !isAuthenticated) {
      navigate('/onboarding/login');
    }
  }, [isAuthenticated, isDiscordLoading, navigate]);

  // 입력 변경 핸들러
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value);
  };

  const handleIntroduceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntroduce(e.target.value);
  };

  // 글자 수 검사
  const isInsufficientLength = introduce.length < INTRODUCE_QUESTION.minLength;
  const isExceededMaxLength = introduce.length > INTRODUCE_QUESTION.maxLength;
  const isInvalidLength = isInsufficientLength || isExceededMaxLength;

  // 프로필 업데이트
  const updateProfile = async () => {
    if (!session?.session?.user?.id) return;

    // 유효성 검사
    if (!username.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!gender) {
      setError('성별을 선택해주세요.');
      return;
    }

    if (!introduce.trim()) {
      setError('자기소개를 입력해주세요.');
      return;
    }

    if (isInsufficientLength) {
      setError(`자기소개는 ${INTRODUCE_QUESTION.minLength}자 이상으로 작성해주세요.`);
      return;
    }

    if (isExceededMaxLength) {
      setError(`자기소개는 ${INTRODUCE_QUESTION.maxLength}자 이하로 작성해주세요.`);
      return;
    }

    setError('');
    setIsProfileLoading(true);

    const updates = {
      gender,
      introduce,
      updated_at: new Date().toISOString(),
      username,
    };

    const { error } = await supabase.from('profiles').update(updates).eq('id', session.session.user.id);

    if (error) {
      console.error('프로필 업데이트 오류:', error);
      setError('프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(false);

    // 홈페이지로 이동
    navigate('/');
  };

  // 로딩 중 렌더링
  if (isDiscordLoading || isProfileLoading) {
    return (
      <ProfileContainer>
        <Card>
          <Title>잠시만 기다려주세요</Title>
          <Subtitle>프로필 정보를 불러오는 중입니다...</Subtitle>
        </Card>
      </ProfileContainer>
    );
  }

  // 디스코드 미연동 시 안내 메시지
  if (!isJoined) {
    return (
      <ProfileContainer>
        <Card>
          <Title>디스코드 연동 필요</Title>
          <Subtitle>소셜데브클럽 디스코드 서버에 가입해주세요.</Subtitle>
          <Button primary onClick={() => navigate('/onboarding/discord')}>
            디스코드 연동하기
          </Button>
        </Card>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Card>
        <Title>환영합니다, {nickname}님!</Title>
        <Subtitle>소셜데브클럽에서 사용할 프로필을 설정해주세요</Subtitle>

        <FormContainer>
          <SectionTitle>기본 정보</SectionTitle>

          <AvatarContainer>
            <Avatar imageUrl={avatarUrl}>{!avatarUrl && <AvatarPlaceholder>?</AvatarPlaceholder>}</Avatar>
            <p>디스코드 프로필 이미지</p>
          </AvatarContainer>

          <FormItem>
            <Label>닉네임 *</Label>
            <Input type="text" value={username} onChange={handleUsernameChange} placeholder="닉네임을 입력하세요" />
            <FooterText>디스코드 서버의 닉네임으로 자동 설정됩니다.</FooterText>
          </FormItem>

          <FormItem>
            <Label>성별 *</Label>
            <RadioGroup>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="gender"
                  value="M"
                  checked={gender === 'M'}
                  onChange={handleGenderChange}
                />
                <span>남성</span>
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="gender"
                  value="F"
                  checked={gender === 'F'}
                  onChange={handleGenderChange}
                />
                <span>여성</span>
              </RadioLabel>
            </RadioGroup>
          </FormItem>

          <SectionTitle>자기소개</SectionTitle>
          <FormItem>
            <Question>{INTRODUCE_QUESTION.question}</Question>
            <TextArea value={introduce} onChange={handleIntroduceChange} placeholder={INTRODUCE_QUESTION.placeholder} />
            <CharCount isExceeded={isInvalidLength}>
              {introduce.length}/{INTRODUCE_QUESTION.minLength}~{INTRODUCE_QUESTION.maxLength}자
            </CharCount>
          </FormItem>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormItem>
            <Button
              primary
              onClick={updateProfile}
              disabled={!username || !gender || isInvalidLength || isProfileLoading}
            >
              {isProfileLoading ? '저장 중...' : '프로필 완료하기'}
            </Button>
          </FormItem>
        </FormContainer>
      </Card>
    </ProfileContainer>
  );
};

export default ProfileEditPage;
