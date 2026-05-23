import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'APROVA',
  description: 'Dashboard e PDV APROVA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
