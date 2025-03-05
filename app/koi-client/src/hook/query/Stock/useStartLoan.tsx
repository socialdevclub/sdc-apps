import { Request, Response } from 'shared~type-stock';
import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useStartLoan = () => {
  return useMutation<Request.PostLoan, Response.Common>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/user/loan',
    },
  });
};

export default useStartLoan;
