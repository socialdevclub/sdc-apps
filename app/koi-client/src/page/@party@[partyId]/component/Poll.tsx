import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Checkbox, Dropdown, List, MenuProps, Progress, Radio, message } from 'antd';
import { useAtomValue, useSetAtom } from 'jotai';
import { CaretDownFilled } from '@ant-design/icons';
import { Query } from '../../../hook';
import { UiStore, UserStore } from '../../../store';

const Poll = () => {
  const { partyId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const setIsScrollView = useSetAtom(UiStore.isScrollView);

  useEffect(() => {
    setIsScrollView(false);
    return () => {
      setIsScrollView(true);
    };
  }, [setIsScrollView]);

  const { data: profile } = Query.Supabase.useMyProfile({ supabaseSession });
  const { data: party } = Query.Party.useQueryParty(partyId);
  const { data: poll } = Query.Poll.useQueryPoll(party?.activityName);
  const { mutateAsync: toggleVote, isLoading: isLoadingSubmit } = Query.Poll.useToggleVote();

  const [selectedVoteList, setSelectedVoteList] = React.useState<{ isSelected: boolean; title: string }[]>(
    poll?.votes.map((v) => ({
      isSelected: v.userIds.some((userId) => userId === supabaseSession?.user.id),
      title: v.title,
    })) ?? [],
  );

  const isDisabledToggle = poll?.status !== 'OPEN' || isLoadingSubmit;
  const myGender = profile?.data?.gender;

  if (!supabaseSession) {
    return <></>;
  }

  if (!party || !poll) {
    return <></>;
  }

  return (
    <>
      {contextHolder}
      <List
        itemLayout="horizontal"
        header={<span>{poll.title}</span>}
        dataSource={poll.votes}
        renderItem={(vote) => {
          const selectedVote = selectedVoteList.find((selectedVote) => selectedVote.title === vote.title);

          const isLimitedGenderVote = vote.limitMaleCount !== undefined || vote.limitFemaleCount !== undefined;
          const isLimitedAllVote = vote.limitAllCount !== undefined;
          const isLimitedVote = isLimitedGenderVote || isLimitedAllVote;

          const isLimitedGenderPoll = poll.limitMaleCount !== undefined || poll.limitFemaleCount !== undefined;
          const isLimitedAllPoll = poll.limitAllCount !== undefined;
          const isLimitedPoll = isLimitedGenderPoll || isLimitedAllPoll;

          const userProfiles = vote.userIds.map((userId) => poll.users.find((user) => user.userId === userId));
          const countAll = userProfiles.length;
          const [countMale, countFemale, countUnknown] = userProfiles.reduce(
            ([male, female, unknown], user) => {
              if (!user) {
                return [male, female, unknown];
              }

              if (user.gender === 'M') {
                return [male + 1, female, unknown];
              }

              if (user.gender === 'F') {
                return [male, female + 1, unknown];
              }

              return [male, female, unknown + 1];
            },
            [0, 0, 0],
          );

          const ratio = isLimitedVote
            ? isLimitedGenderVote
              ? myGender === 'M'
                ? countMale / (vote.limitMaleCount ?? 1)
                : myGender === 'F'
                ? countFemale / (vote.limitFemaleCount ?? 1)
                : (countMale + countFemale + countUnknown) / (vote.limitAllCount ?? 1)
              : (countMale + countFemale + countUnknown) / (vote.limitAllCount ?? 1)
            : isLimitedPoll
            ? isLimitedGenderPoll
              ? myGender === 'M'
                ? countMale / (poll.limitMaleCount ?? 1)
                : myGender === 'F'
                ? countFemale / (poll.limitFemaleCount ?? 1)
                : (countMale + countFemale + countUnknown) / (poll.limitAllCount ?? 1)
              : (countMale + countFemale + countUnknown) / (poll.limitAllCount ?? 1)
            : userProfiles.length / poll.users.length;

          const items: MenuProps['items'] = userProfiles.map((user) => ({
            key: `${user?.userId}`,
            label: `(${user?.gender === 'M' ? '남' : user?.gender === 'F' ? '여' : '?'}) ${user?.nickname}`,
          }));

          return (
            <List.Item
              actions={[
                <Dropdown
                  menu={{ items }}
                  trigger={['click']}
                  placement="bottomRight"
                  disabled={countAll === 0}
                  key={vote.title}
                >
                  <span>
                    {countAll}명 <CaretDownFilled />
                  </span>
                </Dropdown>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  poll.isMultipleVote ? (
                    <Checkbox
                      disabled={isDisabledToggle && ratio >= 1}
                      checked={selectedVote?.isSelected}
                      onClick={() =>
                        setSelectedVoteList((prev) => {
                          if (!selectedVote) {
                            return prev;
                          }

                          selectedVote.isSelected = !selectedVote.isSelected;
                          return [...prev];
                        })
                      }
                    />
                  ) : (
                    <Radio
                      disabled={isDisabledToggle && ratio >= 1}
                      checked={selectedVote?.isSelected}
                      onClick={() =>
                        setSelectedVoteList((prev) => {
                          if (!selectedVote) {
                            return prev;
                          }

                          // const prevSelectedVote = selectedVote.isSelected;

                          prev.forEach((v) => {
                            v.isSelected = false;
                          });

                          selectedVote.isSelected = !selectedVote.isSelected;
                          return [...prev];
                        })
                      }
                    />
                  )
                }
                title={vote.title}
                description={<Progress percent={ratio * 100} showInfo={false} />}
              />
            </List.Item>
          );
        }}
      />
      <Button
        loading={isLoadingSubmit}
        onClick={() => {
          toggleVote({
            exitVoteTitles: selectedVoteList.filter((v) => !v.isSelected).map((v) => v.title),
            joinVoteTitles: selectedVoteList.filter((v) => v.isSelected).map((v) => v.title),
            pollId: poll._id,
            user: {
              avatarUrl: profile?.data?.avatar_url,
              gender: myGender,
              nickname: profile?.data?.username,
              userId: supabaseSession.user.id,
            },
          })
            .then(() => {
              messageApi.open({
                content: `투표가 완료되었습니다.`,
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
        }}
      >
        투표하기
      </Button>
    </>
  );
};

export default Poll;
