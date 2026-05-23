import { Suspense } from 'react';
import TokenScreen from './TokenScreen';

export default function WorkerTokenPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-aprova-black text-aprova-yellow">
          <p className="text-lg font-black uppercase tracking-[0.2em]">Gerando token</p>
        </main>
      }
    >
      <TokenScreen />
    </Suspense>
  );
}
