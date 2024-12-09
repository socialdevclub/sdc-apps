import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useDeleteParty = (partyId: string | undefined) => {
  return useMutation<object, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'DELETE',
      pathname: `/party?partyId=${partyId}`,
    },
  });
};

export default useDeleteParty;
