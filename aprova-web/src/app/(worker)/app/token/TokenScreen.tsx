'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import TokenSuccessScreen from '../components/TokenSuccessScreen';
import { workerOffers } from '../worker-data';

function createToken(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

// Stable token per page load (avoids regeneration on re-renders)
let _sessionToken: string | null = null;
function getSessionToken(): string {
  if (!_sessionToken) _sessionToken = createToken();
  return _sessionToken;
}

export default function TokenScreen() {
  const searchParams = useSearchParams();
  const offerId     = searchParams.get('offer')    ?? '';
  const installments = Number(searchParams.get('parcelas') ?? '12');

  const offer = useMemo(
    () => workerOffers.find((o) => o.id === offerId),
    [offerId],
  );

  const token = getSessionToken();

  if (!offer) {
    return (
      <TokenSuccessScreen
        token={token}
        procedureName="Oferta APROVA"
        partnerName="Parceiro APROVA"
        partnerWhatsApp="5511991230001"
        installments={installments}
      />
    );
  }

  return (
    <TokenSuccessScreen
      token={token}
      procedureName={offer.title}
      partnerName={offer.partner}
      partnerWhatsApp={offer.partnerWhatsApp}
      installments={installments}
      totalValue={offer.price}
    />
  );
}
