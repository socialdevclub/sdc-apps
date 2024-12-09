import React from 'react';

interface Props {
  children?: React.ReactNode;
}

const EmptyProvider = ({ children }: Props) => <>{children}</>;

export default EmptyProvider;
