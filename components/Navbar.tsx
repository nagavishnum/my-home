'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    name: 'Dashboard',
    path: '/dashboard'
  },
  {
    name: 'Expenses',
    path: '/expenses'
  },
  {
    name: 'Finance',
    path: '/financebook'
  },
  {
    name: 'Todos',
    path: '/todos'
  }
];

export default function Tabs() {
  const pathname = usePathname();

  return (
    <div className='tabs'>
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          href={tab.path}
          prefetch={false}
          scroll={false}
          className={
            pathname === tab.path
              ? 'tab active-tab'
              : 'tab'
          }
        >
          {tab.name}
        </Link>
      ))}
    </div>
  );
}