import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Query } from '../../../hook';
import { UserStore } from '../../../store';
import Header from '../../../component-presentation/Header';
import ProfileValidator from '../../../component/ProfileValidator';

const MainHeader = () => {
  const navigate = useNavigate();
  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data, isError } = Query.Supabase.useQueryAvatarUrl({ supabaseSession });

  const isVisibleAvatar = !isError;

  return (
    <ProfileValidator>
      <Header
        avatar={{
          isVisible: isVisibleAvatar,
          onClick: () => {
            navigate('/profile');
          },
          src: data,
        }}
        CenterComponent={<Title>소셜데브클럽</Title>}
      />
    </ProfileValidator>
  );
};
const Title = styled.div`
  color: white;
  font-size: 20px;
`;

export default MainHeader;
