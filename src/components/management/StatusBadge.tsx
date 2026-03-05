type StatusType = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'PAID' | 'UNPAID';

type StatusBadgeProps = {
  status: StatusType | string;
  onClick?: () => void;
}
export default function StatusBadge({
  status,
  onClick,
}: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; styles: string }> = {
    ACTIVE: {
      label: '사용중',
      styles: 'bg-background-blue text-label-primary'
    },
    PENDING: {
      label: '대기',
      styles: 'bg-background-red text-line-negative',
    },
    INACTIVE: {
      label: '비활성화',
      styles: 'bg-background-neutral text-label-normal',
    },
    PAID: {
      label: '납부 완료',
      styles: 'bg-background-blue text-label-primary',
    },
    UNPAID: {
      label: '미납',
      styles: 'bg-background-neutral text-label-normal',
    },
  };
  const config = statusConfig[status] || statusConfig['INACTIVE'];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        px-2 py-1 rounded-lg text-body-2 ${config.styles}`}
    >
      {config.label}
    </button>
  )
}