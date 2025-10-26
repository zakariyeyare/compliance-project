// jeg har lavet et setup step for at indsamle firmanavn og standard valg.
import Input from '../../components/form/Input.jsx';
import Select from '../../components/form/Select.jsx';

export default function CompanyInfoStep({ values, standards, onChange, onNext, onBack }) {
  const canNext = values.name.trim().length > 1 && values.standardId;

  return (
    <div style={{ display:'grid', gap:14 }}>
      <h3>Virksomhed & Standard</h3>

      <Input
        label="Firmanavn"
        placeholder="Indtast firmanavn"
        value={values.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />

      <Select
        label="Vælg standard"
        value={values.standardId}
        onChange={(e) => onChange({ standardId: e.target.value })}
      >
        <option value="">Vælg compliance standard</option>
        {standards.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </Select>

      <div style={{ display:'flex', gap:12, marginTop:8 }}>
        <button type="button" onClick={onBack}>Tilbage</button>
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          style={{
            padding:'10px 14px',
            borderRadius:8,
            background:'#0b0b23',
            color:'#fff',
            opacity: canNext ? 1 : .5
          }}
        >
          Næste
        </button>
      </div>
    </div>
  );
}
