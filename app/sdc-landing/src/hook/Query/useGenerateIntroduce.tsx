import { useMutation } from 'lib-react-query';

const useGenerateIntroduce = () => {
  return useMutation({
    api: {
      hostname: 'https://api.socialdev.club',
      method: 'POST',
      pathname: '/ai/introduction',
    },
  });
};

export default useGenerateIntroduce;
