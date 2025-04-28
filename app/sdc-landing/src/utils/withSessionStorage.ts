/**
 * API 응답 데이터를 SessionStorage에 캐싱하는 고차 함수
 *
 * @param fetchFn 원본 데이터를 가져오는 함수
 * @param cacheKey SessionStorage에 저장할 때 사용할 키
 * @param cacheDuration 캐시 유효 기간 (밀리초), 기본값 5분
 * @returns SessionStorage 캐싱이 적용된 새로운 함수
 */
const withSessionStorage = <T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  cacheDuration: number = 5 * 60 * 1000,
): (() => Promise<T>) => {
  return async (): Promise<T> => {
    // 브라우저 환경이 아닌 경우 원본 함수 실행
    if (typeof window === 'undefined') {
      return fetchFn();
    }

    // SessionStorage에서 캐시된 데이터 확인
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);

        // 캐시가 유효한 경우
        if (Date.now() - timestamp <= cacheDuration) {
          return data as T;
        }

        // 캐시가 만료된 경우 제거
        sessionStorage.removeItem(cacheKey);
      } catch (error) {
        // 잘못된 캐시 데이터인 경우 제거
        sessionStorage.removeItem(cacheKey);
      }
    }

    // 원본 함수 실행하여 데이터 가져오기
    const data = await fetchFn();

    // 가져온 데이터를 SessionStorage에 저장
    const cacheData = {
      data,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));

    return data;
  };
};

export default withSessionStorage;
