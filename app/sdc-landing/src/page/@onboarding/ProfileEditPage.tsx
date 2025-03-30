import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Query } from '../../hook';
import { supabase } from '../../library/supabase';
import useGenerateIntroduce from '../../hook/Query/useGenerateIntroduce';

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

const HelpButton = styled(Button)`
  margin-top: 10px;
  background-color: #2e2e2e;

  &:hover {
    background-color: #3e3e3e;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin: 10px 0;
  font-size: 14px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1e1e1e;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 20px;
  color: white;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
`;

const PreviewContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 15px;
  background-color: #2a2a2a;
`;

const PreviewTitle = styled.h4`
  font-size: 16px;
  margin-bottom: 10px;
  color: #ddd;
`;

// 로딩 스피너 스타일
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #5865f2;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #ddd;
  font-size: 16px;
  text-align: center;
`;

// 자기소개 질문 리스트
const INTRO_QUESTIONS = [
  {
    placeholder:
      '예) 저는 프론트엔드 개발자로 일하고 있으며, 사용자에게 직접적인 가치를 전달할 수 있어 이 일을 선택했습니다. 사용자가 편리하게 서비스를 이용하는 모습을 볼 때 가장 큰 보람을 느낍니다.',
    question: '현재 무슨 일을 하며, 왜 그 일을 선택했고, 어떤 순간에 가장 큰 보람을 느끼나요?',
  },
  {
    placeholder:
      '예) 업무 외에는 등산과 독서를 즐기며, 최근에는 3D 모델링을 독학하고 있습니다. 여러 스타트업에서 일한 경험을 바탕으로 초기 서비스 개발 노하우를 나눌 수 있어요.',
    question:
      '업무 외에 즐기는 활동이나 새롭게 도전 중인 분야는 무엇인가요? 다른 멤버들과 나누고 싶은 특별한 지식이나 경험이 있나요?',
  },
  {
    placeholder:
      '예) 개발자들과 함께 게임을 만들어보고 싶어 소셜데브클럽에 관심을 갖게 되었습니다. 함께 게임 개발 경험을 쌓고 의미 있는 네트워크를 형성하고 싶습니다.',
    question: '소셜데브클럽에 관심을 갖게 된 이유와 여기서 이루고 싶은 목표는 무엇인가요?',
  },
  {
    placeholder:
      '예) 저는 팀원들의 의견을 경청하고 조율하는 능력이 강점이지만, 때로는 완벽을 추구하다 일정이 지연되는 약점이 있습니다. 그래서 항상 일정 관리에 신경쓰려고 노력합니다.',
    question: '팀 프로젝트에서 자신의 강점과 약점은 무엇이라고 생각하나요?',
  },
  {
    placeholder:
      '예) 개발자들의 일상을 담은 시뮬레이션 게임을 만들어보고 싶어요. 코딩 챌린지와 협업 미션을 수행하며 레벨업하는 게임이면 재미있을 것 같습니다.',
    question: '멤버들과 함께 만들어보고 싶은 게임이나 프로젝트 아이디어가 있나요?',
  },
];

// 자기소개 질문 정보
const INTRODUCE_QUESTION = {
  id: 'introduce',
  maxLength: 2000,
  minLength: 200,
  placeholder:
    '예) 저는 개발자로 일하면서 항상 더 재미있는 서비스를 만들고 싶었어요. 소셜데브클럽에서 게임과 커뮤니티가 결합된 프로젝트를 함께할 수 있어 기대돼요!',
  question: '당신만의 특별한 이야기나 경험을 들려주세요. 소셜데브클럽에서 함께하게 된 계기도 궁금해요! (200~2000자)',
};

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
  HELPER_ANSWERS: 'sdc_profile_helper_answers',
  INTRODUCE: 'sdc_profile_introduce',
};

// 자기소개 프로필 컴포넌트
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
  const { mutateAsync: generateIntroduce, isLoading: isGeneratingIntroduce } = useGenerateIntroduce();

  // Supabase 세션 가져오기
  const { data: session } = Query.Supabase.useGetSession();

  // 상태 관리
  const [username, setUsername] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [introduce, setIntroduce] = useState<string>('');
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // 자기소개 도우미 관련 상태
  const [isHelperOpen, setIsHelperOpen] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedIntroduce, setGeneratedIntroduce] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // 디바운스 타이머 상태 추가
  const [introduceDebounceTimer, setIntroduceDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [answerDebounceTimer, setAnswerDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 디바운스 함수 - 자기소개 저장
  const saveIntroduceToLocalStorage = useCallback((text: string) => {
    localStorage.setItem(STORAGE_KEYS.INTRODUCE, text);
  }, []);

  // 디바운스 함수 - 도우미 답변 저장
  const saveAnswersToLocalStorage = useCallback(
    (answersData: Record<string, string>, currentQ: number, currentAns: string) => {
      // 현재 답변을 포함하여 저장
      const updatedAnswers = { ...answersData };
      if (currentAns.trim() && currentQ >= 0 && currentQ < INTRO_QUESTIONS.length) {
        updatedAnswers[INTRO_QUESTIONS[currentQ].question] = currentAns;
      }

      // [{question, answer}, ...] 형태로 변환
      const formattedAnswers = Object.entries(updatedAnswers).map(([question, answer]) => ({
        answer,
        question,
      }));

      localStorage.setItem(STORAGE_KEYS.HELPER_ANSWERS, JSON.stringify(formattedAnswers));
    },
    [],
  );

  // 로컬스토리지에서 데이터 불러오기
  useEffect(() => {
    const loadSavedData = () => {
      // 자기소개 불러오기
      const savedIntroduce = localStorage.getItem(STORAGE_KEYS.INTRODUCE);
      if (savedIntroduce) {
        setIntroduce(savedIntroduce);
      }

      // 도우미 답변 불러오기
      const savedAnswers = localStorage.getItem(STORAGE_KEYS.HELPER_ANSWERS);
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers) as Array<{ question: string; answer: string }>;

          // 객체 형태로 변환
          const answersObject: Record<string, string> = {};
          parsedAnswers.forEach((item) => {
            answersObject[item.question] = item.answer;
          });

          setAnswers(answersObject);

          // 현재 질문에 대한 답변이 있으면 설정
          if (currentQuestionIndex < INTRO_QUESTIONS.length) {
            const currentQuestion = INTRO_QUESTIONS[currentQuestionIndex].question;
            if (answersObject[currentQuestion]) {
              setCurrentAnswer(answersObject[currentQuestion]);
            }
          }
        } catch (error) {
          console.error('도우미 답변 데이터 파싱 오류:', error);
        }
      }
    };

    loadSavedData();
  }, [currentQuestionIndex]);

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

        // 로컬 스토리지에 저장된 자기소개가 없을 때만 DB 데이터 사용
        const savedIntroduce = localStorage.getItem(STORAGE_KEYS.INTRODUCE);
        if (!savedIntroduce && data?.introduce) {
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

  // 자기소개 변경 핸들러 - 디바운스 적용
  const handleIntroduceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setIntroduce(newValue);

    // 이전 타이머 취소
    if (introduceDebounceTimer) {
      clearTimeout(introduceDebounceTimer);
    }

    // 1초 후 로컬스토리지에 저장
    const timerId = setTimeout(() => {
      saveIntroduceToLocalStorage(newValue);
    }, 1000);

    setIntroduceDebounceTimer(timerId);
  };

  // 현재 답변 변경 핸들러 - 디바운스 적용
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCurrentAnswer(newValue);

    // 이전 타이머 취소
    if (answerDebounceTimer) {
      clearTimeout(answerDebounceTimer);
    }

    // 1초 후 로컬스토리지에 저장
    const timerId = setTimeout(() => {
      saveAnswersToLocalStorage(answers, currentQuestionIndex, newValue);
    }, 1000);

    setAnswerDebounceTimer(timerId);
  };

  // 자기소개 도우미 열기
  const openHelper = () => {
    setIsHelperOpen(true);
    setCurrentQuestionIndex(0);

    // 저장된 답변이 있으면 현재 질문의 답변 설정
    const savedAnswer = answers[INTRO_QUESTIONS[0].question];
    setCurrentAnswer(savedAnswer || '');

    // 저장된 답변이 없으면 초기화
    if (Object.keys(answers).length === 0) {
      setAnswers({});
    }
  };

  // 자기소개 도우미 닫기
  const closeHelper = () => {
    // 현재 답변 저장
    if (currentAnswer.trim()) {
      const updatedAnswers = {
        ...answers,
        [INTRO_QUESTIONS[currentQuestionIndex].question]: currentAnswer.trim(),
      };
      setAnswers(updatedAnswers);
      saveAnswersToLocalStorage(updatedAnswers, -1, '');
    }

    setIsHelperOpen(false);
  };

  // 다음 질문으로 이동
  const goToNextQuestion = () => {
    // 현재 답변 저장
    const updatedAnswers = { ...answers };
    if (currentAnswer.trim()) {
      updatedAnswers[INTRO_QUESTIONS[currentQuestionIndex].question] = currentAnswer.trim();
      setAnswers(updatedAnswers);
    }

    // 다음 질문 인덱스로 이동
    if (currentQuestionIndex < INTRO_QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // 다음 질문에 대한 이전 답변이 있으면 설정
      const nextQuestion = INTRO_QUESTIONS[nextIndex].question;
      setCurrentAnswer(updatedAnswers[nextQuestion] || '');

      // 로컬스토리지에 저장
      saveAnswersToLocalStorage(updatedAnswers, nextIndex, updatedAnswers[nextQuestion] || '');
    } else {
      // 모든 질문에 답변했으면 자기소개 생성
      saveAnswersToLocalStorage(updatedAnswers, -1, '');
      generateIntroduction();
    }
  };

  // 이전 질문으로 이동
  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      // 현재 답변 저장
      const updatedAnswers = { ...answers };
      if (currentAnswer.trim()) {
        updatedAnswers[INTRO_QUESTIONS[currentQuestionIndex].question] = currentAnswer.trim();
        setAnswers(updatedAnswers);
      }

      // 이전 질문으로 이동
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      // 이전에 저장된 답변 불러오기
      const prevQuestion = INTRO_QUESTIONS[prevIndex].question;
      setCurrentAnswer(updatedAnswers[prevQuestion] || '');

      // 로컬스토리지에 저장
      saveAnswersToLocalStorage(updatedAnswers, prevIndex, updatedAnswers[prevQuestion] || '');
    }
  };

  // 자기소개 생성 함수
  const generateIntroduction = async () => {
    // 현재 답변 저장
    const updatedAnswers = {
      ...answers,
      [INTRO_QUESTIONS[currentQuestionIndex].question]: currentAnswer.trim(),
    };
    setAnswers(updatedAnswers);

    // 모든 답변의 총 길이 계산
    const totalLength = Object.values(updatedAnswers)
      .filter((answer) => answer.trim().length > 0)
      .join(' ').length;

    // 200자 미만이면 경고 표시
    if (totalLength < INTRODUCE_QUESTION.minLength) {
      setError(
        `답변의 총 길이가 ${totalLength}자로, 최소 ${INTRODUCE_QUESTION.minLength}자에 미치지 못합니다. 좀 더 자세히 답변해 주세요.`,
      );
      return;
    }

    setIsGenerating(true);

    try {
      // API 요청 데이터 구성
      const promptData = {
        data: Object.entries(updatedAnswers).map(([question, answer]) => ({
          answer,
          question,
        })),
      };

      // generateIntroduce 함수 사용
      const result = await generateIntroduce(promptData);
      // 타입 안전하게 처리
      const generatedText =
        typeof result === 'object' && result !== null && 'content' in result ? String(result.content) : '';

      // 미리보기 모드로 전환
      setGeneratedIntroduce(generatedText.trim());
      setIsGenerating(false);
      setIsPreviewMode(true); // 미리보기 모드 활성화
    } catch (err) {
      console.error('자기소개 생성 중 오류 발생:', err);
      setError('자기소개 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsGenerating(false);
    }
  };

  // 미리보기 승인 처리
  const confirmPreview = () => {
    setIntroduce(generatedIntroduce);
    saveIntroduceToLocalStorage(generatedIntroduce);
    setIsPreviewMode(false);
    setIsHelperOpen(false);
    setError('');
  };

  // 미리보기 취소 처리
  const cancelPreview = () => {
    setIsPreviewMode(false);
    setCurrentQuestionIndex(INTRO_QUESTIONS.length - 1); // 마지막 질문으로 돌아감
  };

  // 미리보기 수정 처리
  const editGeneratedIntroduce = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setGeneratedIntroduce(newValue);

    // 이전 타이머 취소
    if (introduceDebounceTimer) {
      clearTimeout(introduceDebounceTimer);
    }

    // 1초 후 로컬스토리지에 저장 - 미리보기 상태에서는 저장하지 않음
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
      avatar_url: avatarUrl,
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

    // 프로필 저장 성공 시 로컬 스토리지 데이터 삭제
    localStorage.removeItem(STORAGE_KEYS.INTRODUCE);

    setIsProfileLoading(false);

    // 홈페이지로 이동
    navigate('/onboarding/profile');
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
            {/* <Question>{INTRODUCE_QUESTION.question}</Question> */}
            <TextArea value={introduce} onChange={handleIntroduceChange} placeholder={INTRODUCE_QUESTION.placeholder} />
            <CharCount isExceeded={isInvalidLength}>
              {introduce.length}/{INTRODUCE_QUESTION.minLength}~{INTRODUCE_QUESTION.maxLength}자
            </CharCount>
            <HelpButton onClick={openHelper}>AI 자기소개 작성 도우미</HelpButton>
          </FormItem>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormItem>
            <Button
              primary
              onClick={updateProfile}
              disabled={!username || !gender || isInvalidLength || isProfileLoading}
            >
              {isProfileLoading ? '저장 중...' : '제출하기'}
            </Button>
          </FormItem>
        </FormContainer>
      </Card>

      {/* 자기소개 작성 도우미 모달 */}
      {isHelperOpen && (
        <Modal>
          <ModalContent>
            {isPreviewMode ? (
              <>
                <ModalTitle>자기소개 미리보기</ModalTitle>
                <PreviewTitle>아래 내용을 확인하고 필요한 경우 수정하세요</PreviewTitle>

                <TextArea value={generatedIntroduce} onChange={editGeneratedIntroduce} style={{ minHeight: '200px' }} />

                <CharCount
                  isExceeded={
                    generatedIntroduce.length < INTRODUCE_QUESTION.minLength ||
                    generatedIntroduce.length > INTRODUCE_QUESTION.maxLength
                  }
                >
                  {generatedIntroduce.length}/{INTRODUCE_QUESTION.minLength}~{INTRODUCE_QUESTION.maxLength}자
                </CharCount>

                <ModalButtons>
                  <Button onClick={cancelPreview}>다시 작성</Button>
                  <Button
                    primary
                    onClick={confirmPreview}
                    disabled={
                      generatedIntroduce.length < INTRODUCE_QUESTION.minLength ||
                      generatedIntroduce.length > INTRODUCE_QUESTION.maxLength
                    }
                  >
                    자기소개로 사용하기
                  </Button>
                </ModalButtons>
              </>
            ) : isGenerating || isGeneratingIntroduce ? (
              // 로딩 UI
              <LoadingContainer>
                <Spinner />
                <LoadingText>AI가 당신의 답변을 바탕으로 자기소개를 생성하고 있습니다...</LoadingText>
                <LoadingText>잠시만 기다려주세요.</LoadingText>
              </LoadingContainer>
            ) : (
              <>
                <ModalTitle>
                  자기소개 작성 도우미 ({currentQuestionIndex + 1}/{INTRO_QUESTIONS.length})
                </ModalTitle>

                <Question>{INTRO_QUESTIONS[currentQuestionIndex].question}</Question>
                <TextArea
                  value={currentAnswer}
                  onChange={handleAnswerChange}
                  placeholder={INTRO_QUESTIONS[currentQuestionIndex].placeholder}
                />

                <ModalButtons>
                  <Button onClick={closeHelper}>취소</Button>
                  {currentQuestionIndex > 0 && <Button onClick={goToPrevQuestion}>이전</Button>}
                  <Button primary onClick={goToNextQuestion}>
                    {currentQuestionIndex === INTRO_QUESTIONS.length - 1 ? '자기소개 생성하기' : '다음'}
                  </Button>
                </ModalButtons>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </ProfileContainer>
  );
};

export default ProfileEditPage;
