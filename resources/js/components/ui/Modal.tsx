import { colors, styles, hoverStyles } from '../../lib/styles';

interface ModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving?: boolean;
  saveLabel?: string;
  error?: string | null;
  children: React.ReactNode;
}

export function Modal({ isOpen, title, subtitle, icon, onClose, onSubmit, isSaving, saveLabel, error, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={{
        ...styles.modalContent,
        maxWidth: '480px',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '28px', borderBottom: `1px solid ${colors.borderSubtle}`, paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && (
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: colors.accentLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>
                {icon}
              </div>
            )}
            <div>
              <h2 style={{ ...styles.pageTitle, fontSize: '20px', marginBottom: '2px' }}>{title}</h2>
              {subtitle && (
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: 0 }}>{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          {children}

          {/* Error banner */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginTop: '8px',
              marginBottom: '8px',
              color: '#f87171',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.buttonSecondary, flex: 1 }}
              {...hoverStyles.buttonSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                ...styles.buttonPrimary,
                flex: 1,
                opacity: isSaving ? 0.5 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
              {...hoverStyles.buttonPrimary}
            >
              {isSaving ? 'Saving...' : (saveLabel ?? 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
