'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/Button';

export function LogoutButton() {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <Button
      variant="danger"
      onClick={() => signOut({ callbackUrl: '/auth/signin?logout=true' })}
    >
      Sign Out
    </Button>
  );
}
