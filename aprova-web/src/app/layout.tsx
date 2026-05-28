import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'APROVA',
    template: '%s | APROVA',
  },
  description: 'Benefícios consignados sem cartão — direto na folha de pagamento.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'APROVA',
    description: 'Benefícios consignados sem cartão — direto na folha de pagamento.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'APROVA' }],
    locale: 'pt_BR',
    type: 'website',
  },
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
