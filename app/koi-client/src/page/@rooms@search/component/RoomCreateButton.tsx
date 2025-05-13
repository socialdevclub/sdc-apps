import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

export default function RoomCreateButton() {
  const navigate = useNavigate();

  const handleMoveToCreate = () => {
    navigate('/rooms/create');
  };

  return (
    <Container>
      <Button onClick={handleMoveToCreate}>방 만들기</Button>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding: 0 16px;
`;

const Button = styled.button`
  width: 100%;
  height: 60px;
  background-color: #6a5acd;
  border-radius: 6px;
  border: 1px solid #1d283a;
  color: white;
  font-size: 24px;
  font-family: inherit;
  cursor: pointer;

  &:hover {
    background-color: #5a4acd;
  }

  &:active {
    background-color: #4a3acd;
  }
`;
