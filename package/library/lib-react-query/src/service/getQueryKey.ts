type Api = {
  /**
   * @deprecated use origin instead
   */
  hostname?: string;
  origin?: string;
  pathname: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object;
};

const getQueryKey = (api: Api): string[] => {
  const origin = api.origin ?? api.hostname ?? window.location.origin;
  const url = `${origin}${api.pathname}`;
  const body = JSON.stringify(api.body);

  return [url, api.method, body];
};

export default getQueryKey;
