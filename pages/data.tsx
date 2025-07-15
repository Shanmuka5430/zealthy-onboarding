// pages/data.tsx

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  about_me?: string;
  birthdate?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  onboarding_progress?: number;
}

export default function DataPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      setUsers(data || []);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  if (loading) return <p>Loading user data...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>User Onboarding Data</h2>
      <table border={1} cellPadding={8} cellSpacing={0} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>About Me</th>
            <th>Birthdate</th>
            <th>Address</th>
            <th>City</th>
            <th>State</th>
            <th>Zip</th>
            <th>Onboarding Progress</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.about_me || '-'}</td>
              <td>{user.birthdate || '-'}</td>
              <td>{user.address || '-'}</td>
              <td>{user.city || '-'}</td>
              <td>{user.state || '-'}</td>
              <td>{user.zip || '-'}</td>
              <td>{user.onboarding_progress ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
