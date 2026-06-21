import { colors, styles } from '../../lib/styles';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  error?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

export function FormInput({ label, type = 'text', value, onChange, placeholder, required, minLength, error, style, containerStyle }: FormInputProps) {
  return (
    <div style={{ ...styles.formGroup, ...containerStyle }}>
      <label style={styles.formLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        style={{
          ...styles.input,
          width: '100%',
          boxSizing: 'border-box' as const,
          borderColor: error ? colors.red : colors.borderSubtle,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentLight}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.red : colors.borderSubtle;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && <p style={{ color: colors.red, fontSize: '11px', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}
