// Global Styles - Dark Theme "Clean Kitchen" Design System
// Based on FRONTEND_IMPLEMENTATION.md design system

export const colors = {
  // Backgrounds
  bgBase: '#0f1117',
  bgCard: '#1e2333',
  bgInput: '#252b3b',
  bgHover: '#2a3045',
  bgSubtle: '#1a1f2e',

  // Borders
  borderStrong: '#3d4666',
  borderSubtle: '#2e3549',

  // Text
  textPrimary: '#f0f2f8',
  textSecondary: '#8892a4',
  textTertiary: '#4e5770',

  // Accent Colors
  accent: '#f97316',
  accentHover: '#fb923c',
  accentLight: '#7c3a0f',

  // Status Colors
  red: '#ef4444',
  redBg: '#450a0a',
  green: '#22c55e',
  greenBg: '#052e16',
  amber: '#f59e0b',
  amberBg: '#451a03',
};

export const styles = {
  // Container
  container: {
    minHeight: '100vh',
    backgroundColor: colors.bgBase,
    display: 'flex',
    flexDirection: 'column' as const,
  },

  // Cards
  card: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '12px',
    padding: '16px',
  },

  cardWithLeftBorder: (borderColor: string) => ({
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.borderSubtle}`,
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: '12px',
    padding: '16px',
  }),

  // Typography
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: '24px',
  },

  cardLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: colors.textSecondary,
    marginBottom: '8px',
  },

  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: '8px',
    fontFamily: '"DM Mono", monospace',
  },

  cardValueRed: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.red,
    marginTop: '8px',
    fontFamily: "\"DM Mono\", monospace",
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: colors.accent,
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background-color 0.15s',
    minHeight: '44px',
  },

  buttonDanger: {
    backgroundColor: colors.red,
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.15s',
    fontSize: '14px',
  },

  buttonSecondary: {
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    padding: '12px 20px',
    borderRadius: '8px',
    border: `1px solid ${colors.borderSubtle}`,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background-color 0.15s',
    minHeight: '44px',
  },

  // Inputs
  input: {
    backgroundColor: colors.bgInput,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '8px',
    padding: '10px 12px',
    color: colors.textPrimary,
    fontSize: '14px',
    minWidth: '150px',
    minHeight: '40px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },

  inputFocus: {
    borderColor: colors.accent,
    boxShadow: `0 0 0 3px ${colors.accentLight}`,
  },

  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },

  tableHeader: {
    backgroundColor: colors.bgSubtle,
    borderBottom: `1px solid ${colors.borderSubtle}`,
  },

  tableHeaderCell: {
    padding: '12px 8px',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },

  tableRow: {
    borderBottom: `1px solid ${colors.borderSubtle}`,
    transition: 'background-color 0.15s',
  },

  tableRowHover: {
    backgroundColor: colors.bgHover,
  },

  tableCell: {
    padding: '12px 8px',
    color: colors.textPrimary,
    fontSize: '14px',
  },

  // Badges
  badge: (color: string, bgColor: string) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    color,
    backgroundColor: bgColor,
  }),

  badgeActive: {
    color: colors.green,
    backgroundColor: colors.greenBg,
  },

  badgeInactive: {
    color: colors.textSecondary,
    backgroundColor: colors.bgInput,
  },

  badgeLowStock: {
    color: colors.red,
    backgroundColor: colors.redBg,
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '256px',
  },

  spinner: {
    width: '32px',
    height: '32px',
    border: `3px solid ${colors.accent}`,
    borderTop: '3px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // Modal
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px',
  },

  modalContent: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },

  // Form
  formGroup: {
    marginBottom: '16px',
  },

  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: colors.textPrimary,
    fontSize: '14px',
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },

  // Flex utilities
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },

  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// Helper function for hover effects
export const hoverStyles = {
  buttonPrimary: {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.accentHover;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.accent;
    },
  },
  buttonDanger: {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = '#dc2626';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.red;
    },
  },
  buttonSecondary: {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.bgHover;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = colors.bgInput;
    },
  },
  card: {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.borderColor = colors.borderStrong;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.borderColor = colors.borderSubtle;
    },
  },
};
