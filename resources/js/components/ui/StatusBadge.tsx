import { colors } from '../../lib/styles';

type BadgeVariant = 'active' | 'inactive' | 'low-stock' | 'manager' | 'employee';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  active:      { color: colors.green,          backgroundColor: colors.greenBg },
  inactive:    { color: colors.textSecondary,  backgroundColor: colors.bgInput },
  'low-stock': { color: colors.red,            backgroundColor: colors.redBg },
  manager:     { color: '#a855f7',             backgroundColor: '#3b0764' },
  employee:    { color: '#3b82f6',             backgroundColor: '#1e3a8a' },
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '600',
      ...variantStyles[variant],
    }}>
      {children}
    </span>
  );
}
