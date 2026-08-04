'use client';

import Tabs from '@/components/Navbar';
import AppHeader from '@/components/pages/AppHeader';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className='container page'>
        <div className='app-header'>
        <Tabs />
        <AppHeader/>
        </div>
        {children}
      </div>
    </ProtectedRoute>
  );
}