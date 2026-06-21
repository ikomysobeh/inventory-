import { colors, styles } from '../../lib/styles';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  containerStyle?: React.CSSProperties;
}

export function FormSelect({ label, value, onChange, options, placeholder, required, containerStyle }: FormSelectProps) {
  return (
    <div style={{ ...styles.formGroup, ...containerStyle }}>
      <label style={styles.formLabel}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          ...styles.input,
          width: '100%',
          boxSizing: 'border-box' as const,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentLight}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.borderSubtle;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
