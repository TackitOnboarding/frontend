import * as React from 'react'
import { Button } from '../ui/Button'

export interface SelectOption<T> {
  value: T
  label: string
  helperText?: string
  icon?: { src: string; alt: string }
}

interface Props<T> {
  options: [SelectOption<T>, SelectOption<T>]
  value: T | ''
  onChange: (next: T) => void
  label?: string
  descriptionText?: string
  placeholderText?: string
  className?: string
  showLabel?: boolean
}

export default function SegmentedSelect<T extends string>({
  options,
  value,
  onChange,
  label,
  descriptionText,
  placeholderText = '옵션을 선택해 주세요',
  className = '',
  showLabel = true,
}: Props<T>) {
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  return (
     <div className={className}>
      {showLabel && label && (
        <>
          <label className="block mb-2 text-body-2sb text-label-normal">
            {label} <span className="text-system-red">*</span>
          </label>
          {descriptionText && (
            <p className="mt-1.5 text-caption text-label-neutral whitespace-pre-line">
              {descriptionText}
            </p>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-3 mt-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="outlined"
            size="outlinedM"
            onClick={() => onChange(option.value)}
            className={`
              w-[190px] h-[48px]
              ${value === option.value ? '!border-line-active !text-label-primary' : ''}
            `}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* 안내 메시지 영역 */}
      {/* <div className="mt-3 flex items-center h-10 w-full rounded-lg bg-[#EEF2FF] pl-3 pr-4 gap-2">
        {selectedOption?.icon ? (
          <img src={selectedOption.icon.src} alt={selectedOption.icon.alt} className="w-5 h-5 shrink-0" />
        ) : (
          <img src="/icons/icon-default.svg" alt="info" className="w-5 h-5 shrink-0" />
        )}
        <p className="text-body-2 text-label-normal">
          {selectedOption?.helperText || placeholderText}
        </p>
      </div> */}
    </div>
  )
}