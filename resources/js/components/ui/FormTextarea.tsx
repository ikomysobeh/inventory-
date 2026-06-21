import { colors, styles } from '../../lib/styles';

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export function FormTextarea({ label, value, onChange, placeholder, required, rows = 3 }: FormTextareaProps) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.formLabel}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={{
          ...styles.input,
          width: '100%',
          boxSizing: 'border-box' as const,
          minHeight: '80px',
          resize: 'vertical' as const,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentLight}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderSubtle;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
