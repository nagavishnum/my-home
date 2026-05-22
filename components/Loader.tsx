'use client';

import { LoaderCircle } from 'lucide-react';

export default function Loader() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <LoaderCircle
        size={80}
        className='spin-loader'
      />
    </div>
  );
}