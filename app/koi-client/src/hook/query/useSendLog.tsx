import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../config/baseUrl';

const useSendLog = (msg: string) => {
  return useMutation<object, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: `/log?msg=${encodeURIComponent(msg)}`,
    },
  });
};

export default useSendLog;
