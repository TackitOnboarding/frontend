import React from 'react';

interface TimePickerProps {
  type: 'ampm' | 'hour';
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const TimePicker = ({ type, onSelect, onClose }: TimePickerProps) => {
  const ampmList = ['오전', '오후'];
  const hourList = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return hour < 10 ? `0${hour}:00` : `${hour}:00`;
  });

  const list = type === 'ampm' ? ampmList : hourList;

  return (
    <div className="absolute top-[calc(100%+4px)] left-0 z-[130] bg-white border border-line-normal rounded-xl py-1">
      <div className={`flex flex-col ${type === 'hour' ? 'max-h-[200px] overflow-y-auto' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {list.map((item) => (
          <button
            key={item}
            className={`px-5 py-2 text-body-2 text-label-normal hover:bg-background-secondary transition-colors text-center whitespace-nowrap`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
              onClose();
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};