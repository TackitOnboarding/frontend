interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
}

export const CalendarModal = ({ isOpen, onClose, children }: CalendarModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5">
      <div className="w-[440px] pt-2 py-6 rounded-2xl bg-white">
        {/* 헤더*/}
        <div className="flex justify-end items-center px-6 py-2 gap-4">
          <button onClick={onClose} className="p-1">
            <img src="/icons/Close.svg" alt="close" className="w-6 h-6"/>
          </button>
        </div>

        {/* 내용 */}
        {children}
      </div>
    </div>
  )
}