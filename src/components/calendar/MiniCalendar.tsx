import React, { useState } from 'react';

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

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  // 이전 달 날짜
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ day: lastDateOfPrevMonth - i, currentMonth: false });
  }
  // 이번 달 날짜
  for (let i = 1; i <= lastDateOfMonth; i++) {
    days.push({ day: i, currentMonth: true });
  }
  // 다음 달 날짜 (6주 42칸 채우기)
  const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, currentMonth: false });
  }

  const handleMonthChange = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="w-[300px] bg-white rounded-2xl p-5 border border-line-normal animate-in fade-in slide-in-from-top-2">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-background-secondary rounded-full transition-colors">
          <img src="/icons/prev-btn.svg" className="w-5 h-5" alt="이전달" />
        </button>
        <span className="text-body-1sb">{year}년 {month + 1}월</span>
        <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-background-secondary rounded-full transition-colors">
          <img src="/icons/next-btn.svg" className="w-5 h-5" alt="다음달" />
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <span key={d} className="text-center text-label-disable text-[12px]">{d}</span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((item, idx) => {
          const cellDate = new Date(year, month, item.day);
          const isSelected = item.currentMonth && 
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === item.day;
          
          const isToday = item.currentMonth && 
            new Date().toDateString() === cellDate.toDateString();

          return (
            <div
              key={idx}
              className={`
                flex items-center justify-center w-9 h-9 cursor-pointer rounded-full text-body-2 transition-all
                ${!item.currentMonth ? 'text-label-disable' : 'text-label-normal'}
                ${isSelected 
                  ? 'bg-interaction-normal text-white font-bold' 
                  : 'hover:bg-background-secondary'}
                ${isToday && !isSelected ? 'text-interaction-normal font-bold' : ''}
              `}
              onClick={() => item.currentMonth && onSelect(cellDate)}
            >
              {item.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};