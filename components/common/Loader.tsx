'use client';

import { LoaderCircle } from 'lucide-react';

export default function Loader() {
  return (
<div
  style={{
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(3px)',
  }}
>

    <LoaderCircle size={60} className="spin-loader" />
  </div>
  );
}