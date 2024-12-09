import React from 'react';

const failbackMessage = `ROOT SUSPENSE`;
const FailBack = () => {
  console.error(failbackMessage);
  return <></>;
};

const Suspense = ({ children }: React.SuspenseProps) => {
  return <React.Suspense fallback={<FailBack />}>{children}</React.Suspense>;
};

export default Suspense;
