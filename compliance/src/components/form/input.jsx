// lille, reusable input component with consistent styling.
export default function Input({ label, ...props }) {
  return (
    <label style={{ display:'grid', gap:6 }}>
      <span>{label}</span>
      <input
        {...props}
        style={{
          padding:'10px 12px',
          border:'1px solid #e5e7eb',
          borderRadius:8
        }}
      />
    </label>
  );
}
