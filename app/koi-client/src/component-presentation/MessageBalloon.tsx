import React from 'react';
import styled from '@emotion/styled';

interface MessageBalloonProps {
  messages: string[];
  backgroundColor?: string;
  textColor?: string;
}

const MessageBalloon = ({ messages, backgroundColor = '#111827', textColor = 'white' }: MessageBalloonProps) => {
  if (!messages || messages.length === 0) return null;

  return (
    <BalloonBox>
      <Triangle style={{ borderBottomColor: backgroundColor }} />
      <Message style={{ backgroundColor, color: textColor }}>
        {messages.map((message) => (
          <span key={message}>{message}</span>
        ))}
      </Message>
    </BalloonBox>
  );
};

const BalloonBox = styled.div`
  padding-left: 20px;
  position: relative;
`;

const Triangle = styled.div`
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid #111827;
  background-color: transparent;
  margin-left: 14px;
`;

const Message = styled.div`
  width: fit-content;
  height: fit-content;
  background-color: #111827;
  border-radius: 8px;
  padding: 12px 18px 12px 12px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  row-gap: 6px;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.5px;
  font-weight: 400;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

export default MessageBalloon;
