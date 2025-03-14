import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';

interface InfoHeaderProps {
  title: string;
  subtitle?: string;
  subTitleColor?: string;
  value: string | number;
  valueFormatted?: string;
  valueColor?: string;
  badge?: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  rightContent?: React.ReactNode;
  src?: string;
  width?: number;
}

const InfoHeader = (props: InfoHeaderProps) => {
  const {
    title,
    subtitle,
    subTitleColor = '#d1d5db',
    value,
    valueFormatted,
    valueColor = 'white',
    badge,
    rightContent,
    src,
    width = 50,
  } = props;

  return (
    <Container>
      <FlexRow>
        <div
          css={css`
            display: flex;
            align-items: center;
            column-gap: 8px;
          `}
        >
          {src && <img src={src} alt={title} width={width} />}
          <FlexColumn>
            <Title>{title}</Title>
            {subtitle && <Subtitle style={{ color: subTitleColor }}>{subtitle}</Subtitle>}
          </FlexColumn>
        </div>
        <FlexColumn style={{ alignItems: 'flex-end', rowGap: '16px' }}>
          <Value style={{ color: valueColor }}>{valueFormatted || value}</Value>
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
  margin: 0;
`;

const Value = styled.span`
  font-size: 32px;
  line-height: 20px;
  font-weight: 400;
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
