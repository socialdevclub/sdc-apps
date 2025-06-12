import styled from '@emotion/styled';
import type { MenuProps } from 'antd';

const DropdownItem = styled.div`
  width: 100%;
  border-radius: 8px;
  color: white;
`;

export const fluctuationMenuItems: MenuProps['items'] = [
  {
    key: '1',
    label: <DropdownItem>총 9분, 1분 마다 주식 변동</DropdownItem>,
  },
  {
    key: '2',
    label: <DropdownItem>총 18분, 2분 마다 주식 변동</DropdownItem>,
  },
  {
    key: '3',
    label: <DropdownItem>총 27분, 3분 마다 주식 변동</DropdownItem>,
  },
  {
    key: '4',
    label: <DropdownItem>총 36분, 4분 마다 주식 변동</DropdownItem>,
  },
  {
    key: '5',
    label: <DropdownItem>총 45분, 5분 마다 주식 변동</DropdownItem>,
  },
];
