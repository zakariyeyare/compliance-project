// reusable select component with consistent styling.
export default function Select({ label, children, ...props }) {
  return (
    <label style={{ display:'grid', gap:6 }}>
      <span>{label}</span>
      <select
        {...props}
        style={{
          padding:'10px 12px',
          border:'1px solid #e5e7eb',
          borderRadius:8
        }}
      >
        {children}
      </select>
    </label>
  );
}