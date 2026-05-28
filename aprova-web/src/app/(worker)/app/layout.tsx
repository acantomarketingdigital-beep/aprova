import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'APROVA — Marketplace',
  description: 'Benefícios consignados para trabalhadores CLT',
};

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${nunito.variable} font-nunito`}>{children}</div>;
}
