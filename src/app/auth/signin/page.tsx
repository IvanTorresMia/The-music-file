'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SignInPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (session) {
    // if user is already signed in
    return <div>Welcome, {session.user?.name}</div>;
  }

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/',
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1>Sign In</h1>

      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Sign in with Google
      </button>

      <form onSubmit={handleCredentials}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block w-full mb-2 p-2 border"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="block w-full mb-4 p-2 border"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-center">
        Don’t have an account?{' '}
        <a href="/auth/signup" className="underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}
