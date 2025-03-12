import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  padding: 12px 0 20px 0;
  flex: 1 1 0;
`;

export const Wrapper = styled.div`
  width: 100%;
`;

export const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const H3 = styled.h3`
  font-size: 16px;
  margin: 0;
`;

export const H4 = styled.h4`
  font-size: 12px;
  font-weight: 500;
  color: #d4d4d8;
  width: 100%;
  opacity: 70%;
`;

export const Empty = styled(H4)`
  text-align: center;
  padding: 32px 0 18px;
`;

export const H5 = styled.h5`
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  margin: 0;
  padding: 8px;
  cursor: pointer;
`;

export const H6 = styled.h6`
  font-size: 10px;
  color: #c084fc;
  margin: 0;
`;

export const H6Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 8px;
  background-color: rgba(192, 132, 252, 0.2);
  border-radius: 20px;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #374151;
  margin-bottom: 16px;
`;

export const FutureInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
`;
export const StickyBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #252836;
  border-top: 1px solid #374151;
  padding: 16px;
  box-sizing: border-box;
`;
