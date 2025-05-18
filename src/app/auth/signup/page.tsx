'use client';

import { useState } from 'react';
import { trpc } from '@/app/utils/trpc';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const createUser = trpc.createUser.useMutation({
    onSuccess: () => {
      // sign in user after signup
      signIn('credentials', {
        email: form.email,
        password: form.password,
        callbackUrl: '/',
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(form);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        {['firstName', 'lastName', 'email', 'password'].map((field) => (
          <input
            key={field}
            name={field}
            type={
              field === 'email'
                ? 'email'
                : field === 'password'
                ? 'password'
                : 'text'
            }
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field as keyof typeof form]}
            onChange={handleChange}
            required
            className="block w-full mb-2 p-2 border"
          />
        ))}
        <button
          type="submit"
          disabled={createUser.status === 'pending'}
          className="w-full px-4 py-2 bg-green-600 text-white rounded"
        >
          {createUser.isPending ? 'Creating…' : 'Create Account'}
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <a href="/auth/signin" className="underline">
          Sign In
        </a>
      </p>
    </div>
  );
}
