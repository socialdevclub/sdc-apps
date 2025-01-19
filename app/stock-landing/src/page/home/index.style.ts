import styled from '@emotion/styled';

const Container = styled.div`s
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
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #4413bf, #29d3ff);
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: bold;
  padding: 12px 24px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

export const Style = {
  Button,
  Container,
  Header,
  Subtitle,
  Title,
};
