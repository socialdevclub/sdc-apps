import styled from '@emotion/styled';
import useInput from '../hook/useInput';

interface Props {
  placeholder?: string;
}

export default function RoomCodeInput({ placeholder = '123456' }: Props) {
  const { roomCode, isValid, handleChange, handleSubmit } = useInput();

  return (
    <Container>
      <Title>방 번호 입력하기</Title>

      <InputContainer onSubmit={handleSubmit}>
        <Input type="text" inputMode="numeric" placeholder={placeholder} value={roomCode} onChange={handleChange} />

        <ConfirmButton type="submit" disabled={roomCode.length === 0}>
          입장하기
        </ConfirmButton>
      </InputContainer>

      {!isValid && <ErrorText>{'앗 그런 방은 없는 것 같아요.\n다시 한번 확인해 주세요!'}</ErrorText>}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 70px 16px 0 16px;
  border-top: 1px solid #1d283a;
`;

const Title = styled.div`
  color: white;
  font-size: 24px;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const InputContainer = styled.form`
  position: relative;
  width: 100%;
  height: 60px;
`;

const Input = styled.input`
  width: 100%;
  height: 100%;
  border: 1px solid #1d283a;
  border-radius: 6px;
  padding: 10px 140px 10px 10px;
  background-color: #030711;
  color: white;
  font-size: 24px;
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
  }
`;

const ConfirmButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #007aff;
  border: 1px solid #007aff;
  border-radius: 6px;
  color: white;
  font-size: 24px;
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: inherit;
  cursor: pointer;

  &:hover {
    background-color: #0066cc;
    border-color: #0066cc;
  }

  &:active {
    background-color: #005299;
    border-color: #005299;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: rgba(220, 38, 38, 0.2);
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-line;
  text-align: center;
`;
