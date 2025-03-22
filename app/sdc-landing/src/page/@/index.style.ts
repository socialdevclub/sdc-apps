import styled from '@emotion/styled';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0rem 1.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  margin-bottom: 1.5rem;
  font-size: 1.2rem;

  @media (max-width: 800px) {
    span {
      display: block;
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  margin-top: 3rem;
  background: rgb(88, 101, 242);
  color: #fff;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;

  &:hover {
    opacity: 0.8;
  }
`;

export const Style = {
  Button,
  Container,
  Subtitle,
  Title,
};
