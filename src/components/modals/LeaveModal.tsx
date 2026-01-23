import Modal from '../modals/Modal';

interface LeaveModalProps {
  isOpen: boolean
    onClose: () => void
    onLeave: () => void 
}

export default function LeaveModal({
  isOpen,
  onClose,
  onLeave,
}: LeaveModalProps) {
  return (
    <Modal
      open={isOpen}
      title="작성을 그만두시겠어요?"
      description="작성 중인 내용이 모두 사라져요."
      cancelText="나가기"
      confirmText="계속 작성하기"
      onCancel={onLeave}
      onConfirm={onClose} 
    />
  )
}