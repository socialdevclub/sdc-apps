import { useMutation } from 'lib-react-query';
import { PartyForm } from 'shared~type-party';
import { serverApiUrl } from '../../../config/baseUrl';

const useCreateParty = () => {
  return useMutation<PartyForm>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/party',
    },
  });
};

export default useCreateParty;
