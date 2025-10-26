import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    attachCurrentUserAsOwner,
    createCompany,
    getStaticStandards,
    listStandards
} from '../lib/Company.js';
import Stepper from '../setup/Stepper.jsx';
import CompanyInfoStep from '../setup/Steps/CompanyInfoStep.jsx';

export default function CompanySetup() {
  const nav = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1); // 1: input, 2: review
  const [values, setValues] = useState({ name: '', standardId: '' });

  // Data/UI state
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hent standards (DB → fallback til statisk)
  useEffect(() => {
    const load = async () => {
      try {
        const rows = await listStandards().catch(() => getStaticStandards());
        setStandards(rows?.length ? rows : getStaticStandards());
      } catch {
        setStandards(getStaticStandards());
      }
    };
    load();
  }, []);

  const update = (patch) => setValues(v => ({ ...v, ...patch }));

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const c = await createCompany({ name: values.name.trim(), standardId: values.standardId });
      await attachCurrentUserAsOwner(c.id);
      nav('/kontrolmal', { replace: true }); // redirect efter succes
    } catch (err) {
      setError(err?.message || 'Kunne ikke oprette virksomheden.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth:720, margin:'24px auto', padding:20, border:'1px solid #e5e7eb', borderRadius:12 }}>
      <Stepper step={step} total={2} />

      {step === 1 && (
        <CompanyInfoStep
          values={values}
          standards={standards}
          onChange={update}
          onBack={() => window.history.back()}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <div style={{ display:'grid', gap:14 }}>
          <h3>Bekræft oplysninger</h3>
          <div>Firmanavn: <strong>{values.name}</strong></div>
          <div>Standard: <strong>{standards.find(s => s.id === values.standardId)?.name || ''}</strong></div>
          {error && <div style={{ color:'#b91c1c' }}>{error}</div>}

          <div style={{ display:'flex', gap:12, marginTop:8 }}>
            <button type="button" onClick={() => setStep(1)}>Tilbage</button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              style={{ padding:'10px 14px', borderRadius:8, background:'#0b0b23', color:'#fff', opacity: loading ? .5 : 1 }}
            >
              {loading ? 'Opretter…' : 'Opret virksomhed'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
