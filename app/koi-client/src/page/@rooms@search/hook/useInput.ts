import { useState } from 'react';

interface ReturnType {
  roomCode: string;
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function useInput(): ReturnType {
  const [roomCode, setRoomCode] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    const numericalValue = value.replace(/[^0-9]/g, '');
    setRoomCode(numericalValue);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log(roomCode);

    setIsValid(false);
  };

  return { handleChange, handleSubmit, isValid, roomCode };
}
