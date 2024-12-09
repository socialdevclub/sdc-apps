const handleResponse = async <T>(response: Response): Promise<T> => {
  const json = await response.json();
  console.debug('🚀 ~ file: handleResponse.ts:3 ~ handleResponse ~ json:', json);

  if (!response.ok) {
    throw Error(`${json.message ?? '알 수 없는 오류가 발생하였습니다.'}`);
  }

  return json;
};

export default handleResponse;
