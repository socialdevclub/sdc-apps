import styled from '@emotion/styled';

export interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  backgroundColor?: string;
  flex?: number;
}

export interface ButtonGroupProps {
  buttons: ButtonProps[];
  direction?: 'row' | 'column';
  gap?: number;
  fullWidth?: boolean;
  padding?: string;
}

const ButtonGroup = ({ buttons, direction = 'row', gap = 8, fullWidth = true, padding = '16px' }: ButtonGroupProps) => {
  return (
    <Container style={{ padding }}>
      <Flex direction={direction} gap={gap}>
        {buttons.map((button) => (
          <Button
            key={button.text}
            onClick={button.onClick}
            disabled={button.disabled}
            style={{
              backgroundColor: button.backgroundColor,
              color: button.color,
              flex: button.flex,
            }}
            fullWidth={fullWidth}
          >
            {button.text}
          </Button>
        ))}
      </Flex>
    </Container>
  );
};

export default ButtonGroup;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Flex = styled.div<{ direction: 'row' | 'column'; gap: number }>`
  width: 100%;
  display: flex;
  flex-direction: ${(props) => props.direction};
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.gap}px;
`;

const Button = styled.button<{ fullWidth: boolean }>`
  width: ${(props) => (props.fullWidth ? '100%' : 'auto')};
  height: 48px;
  background-color: #374151;
  color: white;
  border-radius: 4px;
  border: none;
  font-family: DungGeunMo;
  font-size: 14px;
  line-height: 16px;

  &:disabled {
    opacity: 0.5;
  }
`;
