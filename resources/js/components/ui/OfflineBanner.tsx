import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { colors } from '../../lib/styles';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        backgroundColor: colors.amberBg,
        borderBottom: `2px solid ${colors.amber}`,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: colors.amber,
        fontWeight: '600',
      }}
    >
      <span>⚠️</span>
      <span>You are offline — changes will sync when your connection is restored.</span>
    </div>
  );
}
