import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  about_me?: string;
  birthdate?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  onboarding_step?: number;
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

      <table border={1} cellPadding={8} cellSpacing={0} style={{ width: '100%', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>About Me</th>
            <th>Birthdate</th>
            <th>Street Address</th>
            <th>City</th>
            <th>State</th>
            <th>Zip</th>
            <th>Onboarding Step</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={8}>No users yet.</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.about_me || '-'}</td>
                <td>{user.birthdate || '-'}</td>
                <td>{user.street_address || '-'}</td>
                <td>{user.city || '-'}</td>
                <td>{user.state || '-'}</td>
                <td>{user.zip || '-'}</td>
                <td>{user.onboarding_step}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}