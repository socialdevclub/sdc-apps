/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';

const Container = styled.div`
  color: #fff;
  background: #111;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 0.5rem;

  span {
    color: #29d3ff;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #ddd;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #4413bf, #29d3ff);
  border: none;
  border-radius: 24px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  padding: 12px 24px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const FeatureBox = styled.div`
  overflow: hidden;
  height: 120px; /* 고정 높이 */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  background: #222;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 1rem;
`;

const FeatureText = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 1.3rem;
  color: #ddd;
  animation: slide 3s infinite;

  @keyframes slide {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    10% {
      transform: translateY(0);
      opacity: 1;
    }
    90% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
`;

export const Style = {
  Button,
  Container,
  FeatureBox,
  FeatureText,
  Header,
  Subtitle,
  Title,
};
