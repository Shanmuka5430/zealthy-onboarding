import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function OnboardingStep3() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData.user) {
        router.push('/login'); return;
      }
      const { data: profile, error: profileErr } =
        await supabase
          .from('users')
          .select('street, city, state, zip, onboarding_progress')
          .eq('id', authData.user.id)
          .single();
      if (profileErr) { console.error(profileErr); return; }
      if (profile.onboarding_progress < 2) {
        router.replace('/onboarding/2');
        return;
      }
      if (profile.onboarding_progress > 3) {
        router.replace('/data');
        return;
      }
      setUser(authData.user);
      setAddress({
        street: profile.street || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zip || '',
      });
      setLoading(false);
    };
    init();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving...');
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      onboarding_progress: 3,
    });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Saved! Redirecting...');
      setTimeout(() => router.push('/data'), 1500);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Onboarding Step 3</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Street Address</label>
          <input name="street" value={address.street} onChange={handleChange} style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>City</label>
          <input name="city" value={address.city} onChange={handleChange} style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>State</label>
          <input name="state" value={address.state} onChange={handleChange} style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>ZIP Code</label>
          <input name="zip" value={address.zip} onChange={handleChange} style={styles.input} required />
        </div>
        <button type="submit" style={styles.button}>Finish</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '4rem auto',
    padding: '2rem',
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  } as React.CSSProperties,
  heading: { textAlign: 'center', color: '#2c3e50', marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold', } as React.CSSProperties,
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' } as React.CSSProperties,
  inputGroup: { display: 'flex', flexDirection: 'column' } as React.CSSProperties,
  label: { fontWeight: 600, color: '#34495e', marginBottom: '0.5rem', fontSize: '1.1rem', } as React.CSSProperties,
  input: { padding: '14px', border: '3px solid #3498db', borderRadius: 10, fontSize: '1rem', boxShadow: '0 0 10px rgba(52, 152, 219, 0.3)', outline: 'none', backgroundColor: '#fff', color: '#222', } as React.CSSProperties,
  button: { backgroundColor: '#27ae60', color: '#fff', padding: '16px', fontSize: '1.2rem', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, boxShadow: '0 5px 15px rgba(39, 174, 96, 0.6)', transition: 'background-color 0.3s ease', } as React.CSSProperties,
  message: { marginTop: '1rem', textAlign: 'center', fontWeight: 600, color: '#2ecc71', } as React.CSSProperties,
};
