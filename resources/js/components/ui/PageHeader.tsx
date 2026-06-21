import { styles, hoverStyles } from '../../lib/styles';

interface PageHeaderProps {
  addLabel?: string;
  onAdd?: () => void;
}

export function PageHeader({ addLabel, onAdd }: PageHeaderProps) {
  if (!onAdd) return null;

  return (
    <div style={{ ...styles.flexBetween, marginBottom: '24px' }}>
      <button
        onClick={onAdd}
        style={styles.buttonPrimary}
        {...hoverStyles.buttonPrimary}
      >
        + {addLabel ?? 'Add'}
      </button>
    </div>
  );
}
