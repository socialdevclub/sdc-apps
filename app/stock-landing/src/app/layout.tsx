import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  description: '게임으로 알아가는 이색적인 짜릿함',
  title: '케미 트릭',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
