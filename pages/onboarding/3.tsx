// pages/onboarding/Step3.tsx

import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Step3() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      alert('User not found');
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({
        ...formData,
        onboarding_progress: 3,
      })
      .eq('id', userId);

    if (error) {
      console.error(error);
      alert('Failed to update data');
    } else {
      router.push('/data'); // 🔁 this will now show the correct DataPage
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Step 3: Address Details</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="address"
          placeholder="Street Address"
          value={formData.address}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <input
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <input
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <input
          name="zip"
          placeholder="ZIP Code"
          value={formData.zip}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <button type="submit" style={{ width: '100%', padding: '1rem' }}>
          Submit
        </button>
      </form>
    </div>
  );
}
