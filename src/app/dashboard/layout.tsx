// app/dashboard/layout.tsx
import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Navbar } from '@/components/ui/Navbar';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // run once per request, on the server
  const session = await getServerSession(authOptions);
  if (!session) {
    // Not signed in? Bounce to /auth/signin
    redirect(`/auth/signin?callbackUrl=/dashboard`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}