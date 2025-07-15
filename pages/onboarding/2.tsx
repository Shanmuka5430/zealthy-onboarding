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
    const init = async () => {
      setLoading(true);
      try {
        // retrieve authenticated user
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData.user) {
          router.push('/login');
          return;
        }
        // fetch profile with onboarding_progress
        const { data: profile, error: profileErr } = await supabase
          .from('users')
          .select('about_me, birthdate, onboarding_progress')
          .eq('id', authData.user.id)
          .single();
        if (profileErr) {
          console.error(profileErr);
          return;
        }
        // redirect if step already completed
        if (profile.onboarding_progress > 2) {
          router.replace(`/onboarding/${profile.onboarding_progress}`);
          return;
        }
        // set state from profile
        setUser(authData.user);
        setAboutMe(profile.about_me || '');
        setBirthdate(profile.birthdate ? new Date(profile.birthdate) : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving...');
    const birthdateString = birthdate ? birthdate.toISOString().split('T')[0] : null;
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      about_me: aboutMe,
      birthdate: birthdateString,
      onboarding_progress: 2,
    });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Saved! Redirecting...');
      setTimeout(() => router.push('/onboarding/3'), 1500);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.heading}>Onboarding Step 2</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>About Me</label>
          <textarea
            rows={6}
            value={aboutMe}
            onChange={e => setAboutMe(e.target.value)}
            style={styles.highlightedTextarea}
            placeholder="Tell us about yourself..."
          />
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Birthdate</label>
          <div style={styles.datePickerWrapper}>
            <DatePicker
              selected={birthdate}
              onChange={date => setBirthdate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select your birthdate"
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
        </div>
        <button type="submit" style={styles.button}>Continue</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: 600,
    margin: '4rem auto',
    padding: '2rem',
    borderRadius: 12,
    backgroundColor: '#f0f4f8',
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  } as React.CSSProperties,
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '2rem',
    fontWeight: 700,
    fontSize: '2rem',
  } as React.CSSProperties,
  form: { display: 'flex', flexDirection: 'column' } as React.CSSProperties,
  fieldGroup: { marginBottom: '2rem' } as React.CSSProperties,
  label: {
    display: 'block',
    marginBottom: '0.6rem',
    fontWeight: 600,
    color: '#34495e',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  highlightedTextarea: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    borderRadius: 10,
    border: '3px solid #3498db',
    boxShadow: '0 0 10px rgba(52, 152, 219, 0.3)',
    resize: 'vertical',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
    color: '#222',
    outline: 'none',
  } as React.CSSProperties,
  datePickerWrapper: {
    borderRadius: 10,
    border: '3px solid #3498db',
    boxShadow: '0 0 8px rgba(52, 152, 219, 0.25)',
    padding: 4,
    display: 'inline-block',
  } as React.CSSProperties,
  button: {
    backgroundColor: '#2980b9',
    color: 'white',
    padding: '16px',
    fontSize: '1.2rem',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 5px 15px rgba(41, 128, 185, 0.6)',
    transition: 'background-color 0.3s ease',
  } as React.CSSProperties,
  message: {
    marginTop: '1rem',
    textAlign: 'center',
    fontWeight: 600,
    color: '#27ae60',
  } as React.CSSProperties,
};