import { css } from '@linaria/core';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import styled from '@emotion/styled';
import Header from '../../../component-presentation/Header';
import ProfileValidator from '../../../component/ProfileValidator';

const PartyHeader = () => {
  const navigate = useNavigate();
  // const [messageApi, contextHolder] = message.useMessage();

  // const supabaseSession = useAtomValue(UserStore.supabaseSession);

  // const { data: profile } = Query.Supabase.useMyProfile({ supabaseSession });
  // const { mutateAsync } = Query.useSendLog(`${profile?.data?.username}님의 호스트 띵똥`);

  // const items: MenuProps['items'] = [
  //   {
  //     key: '호스트 띵똥',
  //     label: '호스트 띵똥',
  //     onClick: () => {
  //       mutateAsync({})
  //         .then(() => {
  //           messageApi.open({
  //             content: '호스트 띵똥!',
  //             duration: 2,
  //             type: 'success',
  //           });
  //         })
  //         .catch((e: Error) => {
  //           messageApi.open({
  //             content: `${e.message}`,
  //             duration: 2,
  //             type: 'error',
  //           });
  //         });
  //     },
  //   },
  // ];

  return (
    <ProfileValidator>
      <Header
        LeftComponent={
          <ChevronLeft
            size={32}
            onClick={() => {
              navigate(-1);
            }}
            className={css`
              color: white;
              flex-shrink: 0;
              &:hover {
                cursor: pointer;
              }
            `}
          />
        }
        CenterComponent={<Title>방 만들기</Title>}
        // RightComponent={
        //   <Space>
        //     {/* 대화 추천 상대 리스트 모달 버튼 */}
        //     <SwitchCase
        //       value={party?.activityId ?? ''}
        //       caseBy={{
        //         STOCK: (
        //           <RecommendedPartnersModal
        //             stockId={party?.activityName}
        //             trigger={<Button style={{ border: 'none' }} ghost icon={<Lightbulb color="white" />} />}
        //           />
        //         ),
        //       }}
        //     />
        //     {/* 페이지 새로고침 버튼 */}
        //     <Button
        //       ghost
        //       style={{ border: 'none' }}
        //       icon={<RefreshCcw color="white" />}
        //       onClick={() => (window.location as { reload: (isForceReload: boolean) => void }).reload(true)}
        //     />
        //     {/* 하이안: 잠깐 기능 닫아놈 */}
        //     {/* <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        //       <Button shape="circle" icon={<EllipsisOutlined />} />
        //     </Dropdown> */}
        //   </Space>
        // }
      />
      {/* {contextHolder} */}
    </ProfileValidator>
  );
};

const Title = styled.div`
  font-size: 24px;
  line-height: 135%;
`;

export default PartyHeader;
