import { styles, hoverStyles } from '../../lib/styles';

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  isDeleting?: boolean;
  deleteConfirmMessage?: string;
}

const btnStyle = { padding: '6px 12px', fontSize: '12px', minHeight: '32px' } as const;

export function RowActions({ onEdit, onDelete, onReset, isDeleting, deleteConfirmMessage }: RowActionsProps) {
  const handleDelete = () => {
    const msg = deleteConfirmMessage ?? 'Are you sure you want to delete this record? This cannot be undone.';
    if (window.confirm(msg)) {
      onDelete?.();
    }
  };

  return (
    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
      {onEdit && (
        <button
          onClick={onEdit}
          style={{ ...styles.buttonPrimary, ...btnStyle }}
          {...hoverStyles.buttonPrimary}
        >
          Edit
        </button>
      )}
      {onReset && (
        <button
          onClick={onReset}
          style={{ ...styles.buttonSecondary, ...btnStyle }}
          {...hoverStyles.buttonSecondary}
        >
          Reset
        </button>
      )}
      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ ...styles.buttonDanger, ...btnStyle, opacity: isDeleting ? 0.5 : 1 }}
          {...hoverStyles.buttonDanger}
        >
          Delete
        </button>
      )}
    </div>
  );
}
