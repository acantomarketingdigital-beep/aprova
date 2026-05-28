import PartnerNav from './PartnerNav';

interface PartnerShellProps {
  children: React.ReactNode;
  /** Override gap between sections. Default: gap-8 */
  gap?: 'gap-6' | 'gap-8' | 'gap-10';
  /** Override vertical padding. Default: py-8 */
  py?: 'py-8' | 'py-10';
  /** Override max-width. Default: max-w-7xl */
  maxW?: 'max-w-4xl' | 'max-w-5xl' | 'max-w-7xl' | 'max-w-2xl';
}

export default function PartnerShell({
  children,
  gap = 'gap-8',
  py = 'py-8',
  maxW = 'max-w-7xl',
}: PartnerShellProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <PartnerNav />
      <main className={`mx-auto ${maxW} px-4 sm:px-6 lg:px-8 ${py} flex flex-col ${gap}`}>
        {children}
      </main>
    </div>
  );
}
