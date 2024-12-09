type Api = {
  hostname?: string;
  pathname: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object;
};

const getQueryKey = (api: Api): string[] => {
  const url = `${api.hostname}${api.pathname}`;
  const body = JSON.stringify(api.body);

  return [url, api.method, body];
};

export default getQueryKey;
