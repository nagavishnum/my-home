import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'My Home',
  description: 'Personal finance, expenses and task management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}