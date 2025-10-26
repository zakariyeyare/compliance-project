export default function Stepper({ step, total }) {
  return (
    <div style={{ display:'flex', gap:8, marginBottom:16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height:6,
            flex:1,
            background: i < step ? '#0b0b23' : '#e5e7eb',
            borderRadius:999
          }}
        />
      ))}
    </div>
  );
}
