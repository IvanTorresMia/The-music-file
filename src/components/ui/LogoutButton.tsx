'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <Button
      variant="secondary"
      onClick={() => signOut({ callbackUrl: '/auth/signin?logout=true' })}
    >
      Sign Out
    </Button>
  );
}
