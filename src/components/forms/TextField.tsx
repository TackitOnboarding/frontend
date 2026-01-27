/**
 * 폼 입력 필드 컴포넌트
 * - 텍스트/이메일/비밀번호 입력 공통 UI
 * - 유효성 상태, 보조 메시지, 드롭다운 옵션 처리
 */

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Option = string | number

type Props = {
  id?: string
  label?: React.ReactNode
  required?: boolean
  type?: 'text' | 'email' | 'password'
  value: string
  uppermessage?: string
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  /** 하단 메시지 (에러/헬퍼) */
  message?: React.ReactNode
  /** 비밀번호 눈 토글 */
  showToggle?: boolean
  visible?: boolean
  onToggle?: () => void
  /** 닉네임 등 글자수 카운터 */
  showCount?: boolean
  maxLength?: number
  /** 에러 상태 여부 (테두리/문구 빨간색) */
  invalid?: boolean
  className?: string
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  minLength?: number
  pattern?: string
  disabled?: boolean
  readOnly?: boolean
  rightIconSrc?: string
  dropdownOptions?: Option[]
  onSelectOption?: (v: Option) => void
}

export default function TextField({
  id,
  label,
  required,
  type = 'text',
  value,
  uppermessage,
  placeholder = '',
  onChange,
  onBlur,
  message,
  showToggle = false,
  visible = false,
  onToggle,
  showCount = false,
  maxLength,
  invalid = false,
  className = '',
  autoComplete,
  inputMode,
  minLength,
  pattern,
  disabled,
  readOnly,

  rightIconSrc,
  dropdownOptions,
  onSelectOption,
}: Props) {
  // 비밀번호 보이기/가리기
  const inputType = showToggle ? (visible ? 'text' : 'password') : type
  const isPasswordMasked =
    inputType === 'password' || (type === 'password' && !visible)

  // 드롭다운 상태
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLUListElement | null>(null)

  // 바깥 클릭/ESC 닫기
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  React.useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  // 키보드 탐색
  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[data-opt]'
      ) ?? []
    )
    const current = document.activeElement as HTMLElement | null
    const idx = items.findIndex((n) => n === current)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[Math.min(items.length - 1, Math.max(0, idx + 1))]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[Math.max(0, idx - 1)]?.focus()
    } else if (e.key === 'Enter' && current?.dataset.value) {
      e.preventDefault()
      handleSelect(current.dataset.value)
    }
  }

  const handleSelect = (raw: string) => {
    const v = /^\d+$/.test(raw) ? Number(raw) : raw
    // 외부 콜백
    onSelectOption?.(v)
    // input value 갱신을 위해 onChange 호출(합성 이벤트)
    const synthetic = {
      target: { value: String(v) },
    } as unknown as React.ChangeEvent<HTMLInputElement>
    onChange(synthetic)
    setOpen(false)
  }

  // 오른쪽 공간 확보: 토글/카운트/아이콘 중 하나라도 있으면 패딩 증가
  const hasDropdownIcon = Boolean(
    rightIconSrc && dropdownOptions && dropdownOptions.length > 0
  )
  const hasRightAdornment =
    (showToggle && value) || showCount || hasDropdownIcon
  const rightPadClass = hasRightAdornment ? 'pr-14' : 'pr-11'
  const count = typeof value === 'string' ? value.length : 0
  const listboxId = id ? `${id}-listbox` : undefined

  const borderClasses = invalid
    ? 'border border-line-negative focus:border-line-negative '
    : 'border border-line-normal '

  // 비밀번호 입력 시 ● 크게 표시
  const passwordSizeClasses =
    inputType === 'password' ? 'text-[18px] tracking-[1px]' : 'text-body-2'

  const describedBy = message ? `${id}-desc` : undefined

  return (
    <div className={`mb-4 ${className}`} ref={wrapRef}>
      {/* 라벨 */}
      {label && (
        <label htmlFor={id} className="block mb-2 text-body-2sb">
          <span className="text-label-normal">{label}</span>{' '}
          {required && <span className="text-system-red">*</span>}
        </label>
      )}
      {/* 상단 설명 */}
      {uppermessage && (
        <div className=" mb-2 text-caption 'text-label-neutral">
          {uppermessage}
        </div>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={[
            'w-full h-12 px-[14px] rounded-xl transition outline-none',
            passwordSizeClasses,
            'text-label-normal font-sans',
            'placeholder:text-body-1 placeholder:font-normal placeholder:text-label-assistive',
            'bg-white',
            borderClasses,
            rightPadClass,
            isPasswordMasked ? 'password-mask' : '',
          ].join(' ')}
        />

        {/* 비밀번호 눈 아이콘 */}
        {showToggle && value && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute p-0 -translate-y-1/2 bg-transparent border-0 cursor-pointer right-3 top-1/2 text-label-neutral"
            aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* 오른쪽 SVG 아이콘 버튼(드롭다운 전용) */}
        {!showToggle && hasDropdownIcon && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="옵션 열기"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            className="absolute flex items-center justify-center w-5 h-5 -translate-y-1/2 right-3 top-1/2"
          >
            <img
              src={rightIconSrc}
              alt=""
              aria-hidden="true"
              className="object-contain w-5 h-5 opacity-70"
              draggable={false}
            />
          </button>
        )}

        {/* 글자수 카운트 */}
        {showCount && (
          <div className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-caption text-label-neutral">
            {count}/{maxLength ?? 0}
          </div>
        )}

        {/* 드롭다운 */}
        {open && dropdownOptions && dropdownOptions.length > 0 && (
          <ul
            role="listbox"
            tabIndex={-1}
            ref={listRef}
            id={listboxId}
            onKeyDown={onListKeyDown}
            className="absolute right-0 z-20 mt-2 overflow-auto bg-white divide-y shadow-lg w-[75px] max-h-64 rounded-xl divide-line-normal"
          >
            {dropdownOptions.map((opt) => {
              const active = String(opt) === String(value)
              return (
                <li key={String(opt)} role="option" aria-selected={active}>
                  <button
                    type="button"
                    data-opt
                    data-value={String(opt)}
                    onClick={() => handleSelect(String(opt))}
                    className={[
                      'w-full text-center px-4 py-3 text-body-2 transition-colors',
                      active
                        ? 'bg-[var(--background-neutral)] text-label-normal'
                        : 'hover:bg-[var(--background-neutral)]/60',
                    ].join(' ')}
                  >
                    {String(opt)}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* 하단 메시지 (에러/헬퍼) */}
      {message && (
        <div
          id={describedBy}
          className={`mt-1.5 text-caption ${
            invalid ? 'text-line-negative' : 'text-label-neutral'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
