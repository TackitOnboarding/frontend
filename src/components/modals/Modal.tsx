import * as React from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { ModalButton } from '../ui/ModalButton'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  closeOnOverlay?: boolean
  children?: React.ReactNode
  className?: string
}

export default function Modal({
  open,
  title,
  description,
  confirmText = '메인 액션',
  cancelText = '텍스트',
  onConfirm,
  onCancel,
  closeOnOverlay = true,
  children,
  className,
}: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onCancel])

  if (!open) return null

  const body = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (!closeOnOverlay) return
        if (e.target === overlayRef.current) onCancel?.()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          `
          w-[327px] max-w-[calc(100vw-40px)]
          rounded-2xl
          bg-white
          shadow-[0_8px_40px_rgba(0,0,0,0.12)]
          px-6 pt-6 pb-4
          `,
          className
        )}
      >
        {/* 헤더 */}
        <div className="text-center">
          <h2 id="modal-title" className="text-title-2b text-label-normal">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-body-1 text-label-neutral">{description}</p>
          )}
        </div>

        {/* 추가 콘텐츠 */}
        {children && <div className="mt-4">{children}</div>}

        {/* 버튼 영역 */}
        <div className="flex items-center justify-between gap-2 mt-5">
          <ModalButton variant="ghost" size="m" onClick={onCancel}>
            {cancelText}
          </ModalButton>
          <ModalButton variant="primary" size="m" onClick={onConfirm}>
            {confirmText}
          </ModalButton>
        </div>
      </div>
    </div>
  )

  return createPortal(body, document.body)
}
