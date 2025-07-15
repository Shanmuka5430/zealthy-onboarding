import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import 'react-datepicker/dist/react-datepicker.css';

export default function OnboardingStep2() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aboutMe, setAboutMe] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving...');

    const birthdateString = birthdate ? birthdate.toISOString().split('T')[0] : null;

    const { error } = await supabase.from('users').update({
      about_me: aboutMe,
      birthdate: birthdateString,
      onboarding_progress: 3,
    }).eq('id', user.id);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Saved! Redirecting...');
      setTimeout(() => router.push('/onboarding/3'), 1500);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>Onboarding Step 2</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 'bold' }}>About Me</label>
        <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} placeholder="Tell us about yourself..." rows={5} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #0070f3', marginBottom: '1.5rem', backgroundColor: '#fff', color: '#111' }} />

        <label style={{ fontWeight: 'bold' }}>Birthdate</label>
        <div style={{ border: '2px solid #0070f3', borderRadius: '8px', padding: '6px', marginBottom: '1.5rem', backgroundColor: '#fff' }}>
          <DatePicker
            selected={birthdate}
            onChange={(date) => setBirthdate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select your birthdate"
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            wrapperClassName="date-picker"
          />
        </div>

        <button type="submit" style={{ backgroundColor: '#0070f3', color: 'white', padding: '12px 20px', borderRadius: '8px', width: '100%', fontWeight: 'bold', fontSize: '1rem' }}>Continue</button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
}


