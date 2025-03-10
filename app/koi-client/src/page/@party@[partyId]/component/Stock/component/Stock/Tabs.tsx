import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useSearchParams } from 'react-router-dom';

export type TabsProps = {
  items: {
    key: string;
    label: React.ReactNode;
  }[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
};

export const Tabs = ({ items, defaultActiveKey, onChange }: TabsProps) => {
  const [searchParams] = useSearchParams();
  const pageFromURL = searchParams.get('page') || defaultActiveKey; // ✅ URL에서 page 값 가져오기

  const [currentTab, setCurrentTab] = useState(pageFromURL);

  useEffect(() => {
    setCurrentTab(pageFromURL);
  }, [pageFromURL]);

  const handleTabClick = useCallback(
    (key: string) => {
      setCurrentTab(key);
      onChange?.(key);
    },
    [onChange],
  );

  return (
    <TabWrapper>
      <TabList>
        {items.map((item) => {
          const isActive = item.key === currentTab;
          return (
            <Tab
              key={item.key}
              onClick={() => {
                handleTabClick(item.key);
              }}
              isActive={isActive}
            >
              {item.label}
            </Tab>
          );
        })}
      </TabList>
    </TabWrapper>
  );
};

const TabWrapper = styled.div`
  padding: 0px 12px;
`;

const TabList = styled.div`
  display: flex;
  padding: 4px;
  border-radius: 4px;
  background-color: #030711;
  border: 1px solid #1d283a;
  box-sizing: border-box;
`;

const Tab = styled.button<{ isActive: boolean }>`
  height: 32px;
  padding: 0px 12px;
  font-size: 16px;
  background-color: transparent;
  border: none;
  color: #7f8ea3;
  border-radius: 4px;
  font-family: DungGeunMo;
  ${({ isActive }) =>
    isActive
      ? css`
          color: white;
          background-color: #252836;
        `
      : css``};
`;
