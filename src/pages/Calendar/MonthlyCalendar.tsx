import { useState } from "react"

// 달력 날짜 계산 로직
const getCalendarDays = (year: number, month: number) => {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const days = [];

  // 1. 지난 달 날짜 채우기 (연한 회색 숫자들)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      year: month === 0 ? year - 1 : year,
      month: month === 0 ? 11 : month - 1,
      day: prevLastDate - i,
      isCurrentMonth: false,
    });
  }

  // 2. 이번 달 날짜 채우기
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ year, month, day: i, isCurrentMonth: true });
  }

  // 3. 다음 달 날짜 채우기 (42칸 정방형 유지)
  let totalSlots;
  if (days.length <= 28) {
    totalSlots = 28;
  } else if (days.length <= 35) {
    totalSlots = 35;
  } else {
    totalSlots = 42;
  }

  const remainingSlots = totalSlots - days.length;
  for (let i = 1; i <= remainingSlots; i++) {
    days.push({ year, month: month + 1, day: i, isCurrentMonth: false });
  }

  return days;
};


export default function MonthlyCalendar() {
  // 화면에 보여줄 기준 날짜 상태(기본값: 오늘
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // const handleToday = () => setViewDate(new Date()); 

  const calendarDays = getCalendarDays(year, month);

  return (
    <div className="flex flex-col w-full h-full pt-6 pb-10 px-9 gap-4">
      {/* 상단 제어바 */}
      <div className="flex w-full justify-between">
        <div className="flex gap-3 items-center">
          <button onClick={handlePrevMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/prev-btn.svg" alt="prevMonth" className="w-8 h-8"/></button>
          <h1 className="text-title1-bold text-label-normal">{year}년 {month + 1}월</h1>
          <button onClick={handleNextMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/next-btn.svg" alt="nextMonth" className="w-8 h-8"/></button>
        </div>
        <div className="flex rounded-lg">
          <button className="w-[122px] h-12 rounded-l-xl rounded-r-none border border-line-normal border-r-0">+ 일정 등록</button>
          <button className="w-[122px] h-12 rounded-r-xl rounded-l-none border border-line-normal">+ 투표 등록</button>
        </div>
      </div>

      {/* 달력 */}
      <div className="w-full">
        {/* 달력 요일 영역 */}
        <div className="grid grid-cols-7 h-9 items-center">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={`text-center text-body-2 ${i === 0 ? 'text-system-red' : 'text-label-normal'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* 달력 날짜 영역 */}
        <div className="grid grid-cols-7 border-t border-l border-line-normal">
          {calendarDays.map((dateObj, index) => {
            const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();
            return (
              <div key={index} className="w-[140px] h-[140px] border-r border-b border-line-normal relative hover:bg-background-alternative transition-colors">
                {/* 날짜 표시 */}
                <div className="flex flex-col items-center">

                  {/* '오늘'의 파란 동그라미*/}
                  {isToday && dateObj.isCurrentMonth && (
                    <div className="absolute top-1 w-7 h-7 bg-interaction-normal rounded-full -z-0" />
                  )}
                  {/* 날짜 숫자 */}
                  <span className={`
                    text-body-2 relative p-2 z-10
                    ${isToday && dateObj.isCurrentMonth
                      ? 'text-label-inverse' // 오늘일 때: 흰색
                      : !dateObj.isCurrentMonth
                        ? 'text-label-disable' // 이번달이 아닐 때
                        : index % 7 === 0
                          ? 'text-system-red' //일요일
                          : 'text-label-normal' //평일
                      }
                  `}>
                    {dateObj.day === 1 && dateObj.isCurrentMonth ? `${month + 1}월 1일` : dateObj.day}
                  </span>
                </div>

                {/* 일정 및 투표 칩 영역 */}
                <div className="">
                  {/* 칩 */}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}