import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Query } from '../../../hook';
import { UserStore } from '../../../store';
import { LOCAL_STORAGE_KEY } from '../../../config/localStorage';

interface ReturnType {
  roomCode: string;
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function useInput(): ReturnType {
  const navigate = useNavigate();

  // 내 유저 세션 & 입장하기 뮤테이션 요청
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const { mutateAsync: joinParty } = Query.Party.useJoinParty();

  const [roomCode, setRoomCode] = useState('');
  const [isValid, setIsValid] = useState(true); // 입장하기 유효성 확인

  // 방 번호 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    const numericalValue = value.replace(/[^0-9]/g, '');
    setRoomCode(numericalValue);
  };

  // 입장하기
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!supabaseSession) {
      setIsValid(false);
      return;
    }

    try {
      await joinParty({ partyId: roomCode, userId: supabaseSession.user.id });
      localStorage.setItem(LOCAL_STORAGE_KEY, roomCode);
      navigate(`/party/${roomCode}`);
    } catch (error) {
      setIsValid(false);
    }
  };

  return { handleChange, handleSubmit, isValid, roomCode };
}
