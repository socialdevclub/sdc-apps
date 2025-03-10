import React from 'react';
import styled from '@emotion/styled';

interface InfoHeaderProps {
  title: string;
  subtitle?: string;
  value: string | number;
  valueFormatted?: string;
  badge?: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  rightContent?: React.ReactNode;
}

const InfoHeader = ({ title, subtitle, value, valueFormatted, badge, rightContent }: InfoHeaderProps) => {
  return (
    <Container>
      <FlexRow>
        <FlexColumn>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </FlexColumn>
        <FlexColumn style={{ alignItems: 'flex-end', rowGap: '16px' }}>
          <Value>{valueFormatted || value}</Value>
          {badge && (
            <Badge style={{ backgroundColor: badge.backgroundColor }}>
              <BadgeText style={{ color: badge.color }}>{badge.text}</BadgeText>
            </Badge>
          )}
          {rightContent}
        </FlexColumn>
      </FlexRow>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const FlexRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  row-gap: 4px;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  row-gap: 4px;
`;

const Title = styled.p`
  font-size: 20px;
  line-height: 22px;
  font-weight: 500;
  margin: 0;
  color: white;
`;

const Subtitle = styled.p`
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: #d1d5db;
  margin: 0;
`;

const Value = styled.span`
  font-size: 32px;
  line-height: 20px;
  font-weight: 400;
  color: white;
`;

const Badge = styled.div`
  padding: 4px 8px;
  border-radius: 100px;
`;

const BadgeText = styled.span`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
`;

export default InfoHeader;
