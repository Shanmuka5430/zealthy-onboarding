import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const allComponents = ['about_me', 'address', 'birthdate'];

export default function AdminPage() {
  const [config, setConfig] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('admin_onboarding_config')
        .select('component_name, page_number');

      if (data) {
        const result: any = {};
        data.forEach((row) => {
          result[row.component_name] = row.page_number;
        });
        setConfig(result);
      }

      setLoading(false);
    }

    fetchConfig();
  }, []);

  function handleChange(component: string, newPage: number) {
    setConfig((prev) => ({
      ...prev,
      [component]: newPage,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');

    // Delete old config
    await supabase.from('admin_onboarding_config').delete().neq('id', 0);

    // Insert new config
    const newConfig = allComponents.map((component) => ({
      component_name: component,
      page_number: config[component] || 2,
    }));

    const { error } = await supabase
      .from('admin_onboarding_config')
      .insert(newConfig);

    if (!error) {
      setMessage('✅ Configuration saved!');
    } else {
      setMessage(`❌ Error: ${error.message}`);
    }

    setSaving(false);
  }

  if (loading) return <p>Loading admin panel...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: 'auto' }}>
      <h2>Admin Onboarding Config</h2>
      <p>Assign each component to Page 2 or Page 3:</p>

      {allComponents.map((component) => (
        <div key={component} style={{ marginBottom: '1rem' }}>
          <label>{component.replace('_', ' ')}:</label>
          <select
            value={config[component] || 2}
            onChange={(e) => handleChange(component, Number(e.target.value))}
            style={{ marginLeft: '1rem' }}
          >
            <option value={2}>Page 2</option>
            <option value={3}>Page 3</option>
          </select>
        </div>
      ))}

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Config'}
      </button>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}