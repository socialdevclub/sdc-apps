import React from 'react';
import { Button, Dropdown, MenuProps, message } from 'antd';
import { ArrowLeftOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useAtomValue } from 'jotai';
import { css } from '@linaria/core';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../component-presentation/Header';
import ProfileValidator from '../../../component/ProfileValidator';
import { Query } from '../../../hook';
import { UserStore } from '../../../store';

const PartyHeader = () => {
  const { partyId } = useParams();
  const { data: party } = Query.Party.useQueryParty(partyId ?? '');

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data: profile } = Query.Supabase.useMyProfile({ supabaseSession });
  const { mutateAsync } = Query.useSendLog(`${profile?.data?.username}님의 호스트 띵똥`);

  const items: MenuProps['items'] = [
    {
      key: '호스트 띵똥',
      label: '호스트 띵똥',
      onClick: () => {
        mutateAsync({})
          .then(() => {
            messageApi.open({
              content: '호스트 띵똥!',
              duration: 2,
              type: 'success',
            });
          })
          .catch((e: Error) => {
            messageApi.open({
              content: `${e.message}`,
              duration: 2,
              type: 'error',
            });
          });
      },
    },
  ];

  return (
    <ProfileValidator>
      <Header
        title={party?.title}
        LeftComponent={
          <ArrowLeftOutlined
            size={60}
            onClick={() => {
              navigate(-1);
            }}
            className={css`
              &:hover {
                cursor: pointer;
              }
            `}
          />
        }
        RightComponent={
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button shape="circle" icon={<EllipsisOutlined />} />
          </Dropdown>
        }
      />
      {contextHolder}
    </ProfileValidator>
  );
};

export default PartyHeader;
