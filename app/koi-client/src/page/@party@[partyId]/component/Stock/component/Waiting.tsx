import styled from '@emotion/styled';
import { useState } from 'react';
import {
  Info,
  Copy,
  ChevronRight,
  Settings,
  ChevronUp,
  ChevronDown,
  UsersRound,
  UserRound,
  Share,
  Play,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { message, Switch, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Query } from '../../../../../hook';

interface Props {
  HeaderComponent?: JSX.Element;
  stockId?: string;
}

const Waiting = ({ HeaderComponent = <></>, stockId }: Props) => {
  const [roomNumber, setRoomNumber] = useState('123456'); // 임시 방번호
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isOpenGameOption, setIsOpenGameOption] = useState(false);
  const [gameOption, setGameOption] = useState({
    isOpenInfo: false,
    personalStockLimit: false,
    publicStockLimit: false,
  });

  const { partyId } = useParams();
  const [messageApi, messageContextHolder] = message.useMessage();

  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: userList } = Query.Stock.useUserList(stockId);
  const { mutateAsync: mutateInitStock } = Query.Stock.useInitStock(stockId);
  const { mutateAsync: mutateUpdateGame } = Query.Stock.useUpdateStock();

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      label: <DropdownItem>총 9분, 1분 마다 주식 변동</DropdownItem>,
    },
    {
      key: '2',
      label: <DropdownItem>총 18분, 2분 마다 주식 변동</DropdownItem>,
    },
    {
      key: '3',
      label: <DropdownItem>총 27분, 3분 마다 주식 변동</DropdownItem>,
    },
    {
      key: '4',
      label: <DropdownItem>총 36분, 4분 마다 주식 변동</DropdownItem>,
    },
    {
      key: '5',
      label: <DropdownItem>총 45분, 5분 마다 주식 변동</DropdownItem>,
    },
  ];

  const copyRoomNumber = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(roomNumber);

      messageApi.success({
        content: '방 번호가 복사되었습니다.',
        duration: 2,
      });
    }
  };

  const openMoreGameOption = () => {
    setIsOpenGameOption(!isOpenGameOption);
  };

  const changeGameTime = ({ key }: { key: string }) => {
    if (!stockId) return;

    mutateUpdateGame({
      _id: stockId,
      fluctuationsInterval: Number(key),
    });
  };

  const changeGameOption = (key: keyof typeof gameOption) => {
    // TODO: 옵션 변경 요청
    setGameOption((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openWideScreen = () => {
    window.open(`${window.location.origin}/backoffice/screen/${partyId}`, '_blank');
  };

  const shareParty = () => {
    if (!stockId) return;

    const url = `${window.location.origin}/party/${partyId}`;
    navigator.clipboard.writeText(url);
  };

  const startGame = async () => {
    if (!stockId) return;

    await mutateInitStock({});
    await mutateUpdateGame({
      _id: stockId,
      isTransaction: true,
    });
  };

  return (
    <Container>
      {messageContextHolder}
      {HeaderComponent}
      <Seperater />
      <BodyContainer>
        <RoomInfoContainer>
          <Tab>
            <Info />
            <TabText>방 정보</TabText>
          </Tab>
          <RoomInfoBox>
            <RoomNumberSection onClick={copyRoomNumber}>
              <RoomText>방 번호: </RoomText>
              <RoomNumber>{roomNumber}</RoomNumber>
              <Copy />
            </RoomNumberSection>
          </RoomInfoBox>
          <WideScreenView onClick={openWideScreen}>
            <WideScreenText>주식 현황판 크게 보기</WideScreenText>
            <ChevronRight />
          </WideScreenView>
          <InfoText>
            PC화면이나 빔 프로젝터를 이용하면
            <br />더 몰입해서 즐길 수 있어요!
          </InfoText>
        </RoomInfoContainer>

        <GameTimeSection>
          <Tab>
            <Settings />
            <TabText>게임 설정</TabText>
          </Tab>
          <GameOptionContainer>
            <GameOption id="game-option-container">
              <GameOptionTitle>게임 시간</GameOptionTitle>
              <Dropdown
                menu={{
                  inlineIndent: 10,
                  items: menuItems,
                  onClick: changeGameTime,
                  style: {
                    backgroundColor: '#030711',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '10px 12px',
                  },
                }}
                trigger={['click']}
                getPopupContainer={() => document.getElementById('game-option-container')!}
              >
                <GameOptionValue dark>
                  <GameOptionText>
                    {menuItems.find((item) => Number(item?.key) === stock?.fluctuationsInterval)?.label}
                  </GameOptionText>
                  {isTimeOpen ? <ChevronUp /> : <ChevronDown />}
                </GameOptionValue>
              </Dropdown>
            </GameOption>
            {isOpenGameOption && (
              <>
                <GameOption gap={34}>
                  <GameOptionTitle>개인주식 보유개수제한</GameOptionTitle>
                  <GameOptionValue>
                    <Switch
                      checked={gameOption.personalStockLimit}
                      onChange={() => changeGameOption('personalStockLimit')}
                      style={{ backgroundColor: gameOption.personalStockLimit ? '#6339E3' : '#030711' }}
                    />
                    <GameOptionText>{gameOption.personalStockLimit ? 'ON' : 'OFF'}</GameOptionText>
                  </GameOptionValue>
                </GameOption>
                <GameOption gap={34}>
                  <GameOptionTitle>시장에 풀린 주식 제한</GameOptionTitle>
                  <GameOptionValue>
                    <Switch
                      checked={gameOption.publicStockLimit}
                      onChange={() => changeGameOption('publicStockLimit')}
                      style={{ backgroundColor: gameOption.publicStockLimit ? '#6339E3' : '#030711' }}
                    />
                    <GameOptionText>{gameOption.publicStockLimit ? 'ON' : 'OFF'}</GameOptionText>
                  </GameOptionValue>
                </GameOption>
                <GameOption gap={34}>
                  <GameOptionTitle>정보 이어진 사람 공개</GameOptionTitle>
                  <GameOptionValue>
                    <Switch
                      checked={gameOption.isOpenInfo}
                      onChange={() => changeGameOption('isOpenInfo')}
                      style={{ backgroundColor: gameOption.isOpenInfo ? '#6339E3' : '#030711' }}
                    />
                    <GameOptionText>{gameOption.isOpenInfo ? 'ON' : 'OFF'}</GameOptionText>
                  </GameOptionValue>
                </GameOption>
              </>
            )}
          </GameOptionContainer>
          <MoreText onClick={openMoreGameOption}>
            <span>{isOpenGameOption ? '접기' : '더보기'}</span>
          </MoreText>
        </GameTimeSection>

        <PlayerSection>
          <Tab>
            <UsersRound />
            <TabText>플레이어</TabText>
          </Tab>
          <PlayerList>
            {userList?.map((user) => (
              <Player key={user.userId}>
                <AvatarContainer>
                  <UserRound />
                </AvatarContainer>
                <PlayerName>{user.userInfo.nickname}</PlayerName>
              </Player>
            ))}
          </PlayerList>
        </PlayerSection>
      </BodyContainer>
      <BottomSheet>
        <ActionButtons>
          <ShareButton>
            <ButtonContent>
              <Share color="white" />
              <ButtonText>공유하기</ButtonText>
            </ButtonContent>
          </ShareButton>
          <StartButton onClick={startGame}>
            <ButtonContent>
              <Play color="white" />
              <ButtonText>게임시작</ButtonText>
            </ButtonContent>
          </StartButton>
        </ActionButtons>
      </BottomSheet>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-bottom: 120px;
`;

const BodyContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  padding-bottom: 0;
  gap: 40px;
  background-color: linear-gradient(to bottom, #111827, #000000);

  * {
    box-sizing: border-box;
  }
`;

const Seperater = styled.div`
  width: 100%;
  height: 1px;
  background-color: #1d283a;
`;

const RoomInfoContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 20px;
`;

const RoomInfoBox = styled.div`
  background-color: #252836;
  border-radius: 8px;
  width: 100%;
  padding: 18px;
  cursor: pointer;
`;

const RoomNumberSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  line-height: 135%;
`;

const RoomText = styled.div`
  font-size: 23px;
`;

const RoomNumber = styled.div`
  font-size: 28px;
  letter-spacing: 4px;
`;

const WideScreenView = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 28px;
  border-radius: 8px;
  background-color: #007aff;
  gap: 10px;
  cursor: pointer;
`;

const Tab = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TabText = styled.div`
  font-size: 23px;
`;

const InfoText = styled.p`
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
`;

const GameTimeSection = styled.div`
  width: 100%;
`;

const GameOptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin-top: 20px;
  background-color: #252836;
  border-radius: 8px;
  gap: 16px;
`;

const GameOption = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  width: 100%;
  gap: ${(props) => (props.gap ? props.gap : 10)}px;

  .ant-dropdown-menu-item {
    padding: 0 !important;
  }
`;

const GameOptionTitle = styled.h2`
  font-size: 18px;
`;

const GameOptionValue = styled.div<{ dark?: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px;
  padding-right: 2px;
  background-color: ${(props) => (props.dark ? '#030711' : undefined)};
  border: 1px solid #1d283a;
  border-radius: 8px;
  cursor: pointer;
  gap: 8px;
  flex-grow: 1;
`;

const DropdownItem = styled.div`
  width: 100%;
  border-radius: 8px;
  color: white;
`;

const GameOptionText = styled.div`
  font-size: 14px;
`;

const MoreText = styled.div`
  margin: 12px 0 0 0;
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);

  > span {
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  }
`;

const WideScreenText = styled.div`
  font-size: 23px;
`;

const PlayerSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  width: 100%;
  margin-top: 20px;
  padding: 12px 16px;
  background-color: #252836;
  border-radius: 8px;
  gap: 16px;
`;

const Player = styled.div<{ isHost?: boolean }>`
  display: flex;
  width: 48px;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const AvatarContainer = styled.div<{ isHost?: boolean }>`
  position: relative;
  width: 100%;
  height: 50px;
  border-radius: 50%;
  background-color: #4b5563;
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${(props) => (props.isHost ? '1px solid #FFB643' : 'none')};
`;

const PlayerName = styled.div<{ isHost?: boolean }>`
  width: 90%;
  font-size: 12px;
  color: ${(props) => (props.isHost ? '#FFB643' : 'white')};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
`;

const BottomSheet = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-top: 1px solid #1d283a;
  border-left: 1px solid #1d283a;
  border-right: 1px solid #1d283a;
  border-radius: 8px 8px 0 0;
  padding: 19px 0;
  background-color: #030711;
  z-index: 1051;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 14px;
`;

const ShareButton = styled.button`
  background-color: #374151;
  border: none;
  border-radius: 8px;
  padding: 14px 24px 14px 16px;
  cursor: pointer;
`;

const StartButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 14px 24px 14px 16px;
  background-color: #6339e3;
  cursor: pointer;
`;

const ButtonContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const ButtonText = styled.span`
  color: white;
  font-size: 23px;
  font-family: 'DungGeunMo', sans-serif;
  line-height: 135%;
`;

export default Waiting;
