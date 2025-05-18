'use client';

import { useState } from 'react';
import { trpc } from '@/app/utils/trpc';

export default function UsersPage() {
  // 1) grab the tRPC context
  const utils = trpc.useUtils();

  // 2) your list query
  const { data: users, isLoading } = trpc.listUsers.useQuery();

  // 3) your mutation
  const createUser = trpc.createUser.useMutation({
    onSuccess() {
      // ✅ invalidate via the context
      utils.listUsers.invalidate();
    },
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({
      firstName,
      lastName,
      email,
      password,
    });
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
  };
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users &&
          users.map((user) => (
            <li key={user.id}>
              {user.firstName} {user.lastName} - {user.email}
            </li>
          ))}
      </ul>
      <h2>Add a user</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}
