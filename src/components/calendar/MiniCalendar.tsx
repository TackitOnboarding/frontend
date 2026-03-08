import React, { useState } from 'react';
import { CalendarUtils } from '../../types/calendar';

interface MiniCalendarProps {
  currentDate: string; // "YYYY-MM-DDTHH:mm" 형식
  onSelect: (date: Date) => void;
}

export const MiniCalendar = ({ currentDate, onSelect }: MiniCalendarProps) => {
  // 현재 선택된 날짜 객체
  const selectedDate = new Date(currentDate);
  // 달력에서 보여줄 기준 달 (초기값은 선택된 날짜의 달)
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = CalendarUtils.getCalendarDays(year, month);

  const handleMonthChange = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="bg-white rounded-xl border border-line-normal p-5">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-3 mb-6">
        <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-background-secondary rounded-full transition-colors">
          <img src="/icons/prev-btn.svg" className="w-6 h-6" alt="이전달" />
        </button>
        <span className="text-body-2sb text-label-normal">{year}년 {month + 1}월</span>
        <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-background-secondary rounded-full transition-colors">
          <img src="/icons/next-btn.svg" className="w-6 h-6" alt="다음달" />
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <span key={d} className="text-center text-label-disable text-caption-regular">{d}</span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((item, idx) => {
          const cellDate = new Date(item.year, item.month, item.day);
          const isSelected = item.isCurrentMonth && 
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === item.day;
          
          const isToday = item.isCurrentMonth && 
            new Date().toDateString() === cellDate.toDateString();

          return (
            <div
              key={idx}
              className={`
                flex items-center justify-center w-9 h-9 cursor-pointer rounded-full text-caption-regular transition-all
                ${!item.isCurrentMonth ? 'text-label-disable' : 'text-label-normal'}
                ${isSelected 
                  ? 'bg-interaction-normal text-white font-bold' 
                  : 'hover:bg-background-secondary'}
                ${isToday && !isSelected ? 'text-interaction-normal font-bold' : ''}
              `}
              onClick={() => item.isCurrentMonth && onSelect(cellDate)}
            >
              {item.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};