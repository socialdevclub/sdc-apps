import styled from '@emotion/styled';

export default function Divider() {
  return (
    <Container>
      <Line />
      <CenterLabel>또는</CenterLabel>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 30px;
  margin: 70px 0;
  padding: 0 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const Line = styled.div`
  width: 100%;
  height: 1px;
  background-color: #1d283a;
`;

const CenterLabel = styled.span`
  width: 50px;
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: #838487;
  font-size: 20px;
  font-family: inherit;
  display: inline-block;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
`;
