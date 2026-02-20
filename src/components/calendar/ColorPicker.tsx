import { useState } from "react"
import { CALENDAR_COLORS, CalendarColorType } from "../../types/calendar";

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: CalendarColorType) => void;
}

export const ColorPicker = ({ selectedColor, onSelect }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeColor = CALENDAR_COLORS.find(color => color.id === selectedColor) || CALENDAR_COLORS[0];

  return (
    <div className="relative">
      {/* 선택된 컬러 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[2px] group"
      >
        <div className={`w-5 h-5 rounded-full ${activeColor.class} transition-transform group-hover:scale-105`} />
        <img src="/icons/trailingIcon.svg" alt="dropdown" className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 드롭다운 메뉴 - 색상 선택 */}
      {isOpen && (
        <>
        {/* 외부 클릭 시 닫하기 위한 투명 레이어 */}
        <div className=" fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
        
        <div className="absolute flex flex-col top-6 -left-2 z-20 gap-2 p-2 rounded-lg bg-white">
          {CALENDAR_COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => {
                onSelect(color.id as CalendarColorType);
                setIsOpen(false)
              }}
              className={`w-6 h-6 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 `}
            >
              {selectedColor === color.id && (
                <img src="/icons/white-check.svg" alt="selected" className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
        </>
      )}
    </div>
  )
}
