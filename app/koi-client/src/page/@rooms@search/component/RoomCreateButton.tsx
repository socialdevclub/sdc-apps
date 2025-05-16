import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PartySchema } from 'shared~type-party';
import { StockSchema } from 'shared~type-stock';
import { UserStore } from '../../../store';
import { Query } from '../../../hook';

interface Props {
  username: string;
}

export default function RoomCreateButton({ username }: Props) {
  const navigate = useNavigate();
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user?.id;

  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const { mutateAsync: createParty } = Query.Party.useCreateParty(); // 방 생성
  const { mutateAsync: createStock } = Query.Stock.useCreateStock(); // 주식게임 방 세션 생성
  const { mutateAsync: updateParty } = Query.Party.useUpdateParty(); // 방 생성 후 세션을 등록용

  const [isError, setIsError] = useState<boolean>(false);

  const handleMoveToCreate = async () => {
    try {
      setCreateLoading(true);

      const createdParty = await createPartyRoom();
      const createdStock = await createStockRoom(createdParty._id);
      await updatePartyRoom(createdParty._id, createdStock._id);

      navigate(`/party/${createdParty._id}`);
    } catch (error) {
      setIsError(true);
    } finally {
      setCreateLoading(false);
    }
  };

  const createPartyRoom = async (): Promise<PartySchema> => {
    try {
      const createdParty = (await createParty({
        authorId: userId,
        limitAllCount: 10,
        limitFemaleCount: 10,
        limitMaleCount: 10,
        title: `${username}님의 방`,
        // Todo:: 결과에 대한 타입 추론 방법 변경 필요(?)
      })) as PartySchema;

      if (!createdParty?._id) {
        throw new Error('방 생성 실패');
      }

      return createdParty;
    } catch (error) {
      setIsError(true);
      throw error;
    }
  };

  const createStockRoom = async (partyId: string): Promise<StockSchema> => {
    try {
      const createdStock = (await createStock({
        partyId,
      })) as StockSchema;

      if (!createdStock?._id) {
        // TODO:: 생성한 방 삭제 필요
        throw new Error('주식게임 세션 생성 실패');
      }

      return createdStock;
    } catch (error) {
      setIsError(true);
      throw error;
    }
  };

  const updatePartyRoom = async (partyId: string, stockId: string): Promise<boolean> => {
    try {
      const updatedParty = await updateParty({
        _id: partyId,
        activityId: 'STOCK',
        activityName: stockId,
      });

      if (!updatedParty) {
        // TODO:: 생성한 방 & 주식 게임 세션 삭제 필요
        throw new Error('방 생성 후 세션 등록 실패');
      }

      return updatedParty;
    } catch (error) {
      setIsError(true);
      throw error;
    }
  };

  return (
    <Container>
      <Button onClick={handleMoveToCreate} disabled={createLoading}>
        방 만들기
      </Button>

      {isError && <ErrorText>{'알 수 없는 이유로 방 생성에 실패했어요!\n다시 한 번 시도해 주세요.'}</ErrorText>}
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
  margin-top: 16px;
`;
