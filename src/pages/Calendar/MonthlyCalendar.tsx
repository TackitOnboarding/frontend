import { useState } from "react"
import { CalendarUtils } from "../../types/calendar";
import { CalendarChip } from "../../components/calendar/CalendarChip";
import { ScheduleRegisterModal } from "../../components/calendar/ScheduleRegisterModal";

const mockSchedules = [
    {
    schedule_id: 1,
    title: "1주차 전체 회의",
    starts_at: "2026-02-02T10:00:00",
    ends_at: "2026-02-02T12:00:00",
    color_chip: "blue",
  },
  {
    schedule_id: 2,
    title: "동아리 워크샵",
    starts_at: "2026-02-03T09:00:00",
    ends_at: "2026-02-05T18:00:00",
    color_chip: "pink",
  },
  {
    schedule_id: 3,
    title: "줄바꿈 테스트",
    starts_at: "2026-02-02T09:00:00",
    ends_at: "2026-02-04T18:00:00",
    color_chip: "green",
  },
  {
    schedule_id: 4,
    title: "겹침 테스트",
    starts_at: "2026-02-07T09:00:00",
    ends_at: "2026-02-09T18:00:00",
    color_chip: "green",
  },
];

const mockVotes = [
  {
    vote_id: 1,
    title: "회식 메뉴 투표",
    starts_at: "2026-02-01T09:00:00",
    ends_at: "2026-02-03T23:59:59",
    color_chip: "gray",
  },
  {
    vote_id: 2,
    title: "투표 테스트",
    starts_at: "2026-02-08T09:00:00",
    ends_at: "2026-02-09T23:59:59",
    color_chip: "gray",
  },
  {
    vote_id: 3,
    title: "투표",
    starts_at: "2026-02-17T09:00:00",
    ends_at: "2026-02-17T23:59:59",
    color_chip: "gray",
  },
];

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

const getRemainingDays = (dateStr: string, endsAt: string) => {
  const start = new Date(dateStr).setHours(0, 0, 0, 0);
  const end = new Date(endsAt.split('T')[0]).setHours(0, 0, 0, 0);
  
  // 밀리초 단위를 일 단위로 변환: (1000ms * 60s * 60m * 24h)
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export default function MonthlyCalendar() {
  // 화면에 보여줄 기준 날짜 상태(기본값: 오늘
  const [viewDate, setViewDate] = useState(new Date());

  // 모달 상태 관리 State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const calendarDays = getCalendarDays(year, month);

  // 현재 날짜 칸에서 렌더링해야 할 아이템들의 순서를 계산하는 함수
  const getRenderItems = (dateStr: string, index: number) => {
    // 1. 해당 날짜에 "걸쳐 있는" 모든 데이터 (줄 번호 고정용)
    const allOngoing = [
      ...mockSchedules.filter(s => CalendarUtils.isDateInRange(dateStr, s.starts_at, s.ends_at)),
      ...mockVotes.filter(v => CalendarUtils.isDateInRange(dateStr, v.starts_at, v.ends_at))
    ].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    return allOngoing.map((item) => {
      // 2. 이 아이템이 전체 목록에서 몇 번째 줄(Row)인지 확인
      const rowIdx = allOngoing.findIndex(i => 
        ('schedule_id' in i && 'schedule_id' in item && i.schedule_id === item.schedule_id) ||
        ('vote_id' in i && 'vote_id' in item && i.vote_id === item.vote_id)
      );

      // 3. 실제로 이 칸에서 "그려야 하는지" 여부 (시작일이거나 일요일인 경우)
      const isSunday = index % 7 === 0;
      const isStartDay = item.starts_at.startsWith(dateStr);
      const shouldRender = isStartDay || (isSunday && !isStartDay);

      return { item, rowIdx, shouldRender };
    });
  };

  return (
    <div className="flex flex-col w-full h-[800px] pt-6 pb-10 px-9 gap-4">
      {/* 상단 제어바 */}
      <div className="flex w-full justify-between">
        <div className="flex gap-3 items-center">
          <button onClick={handlePrevMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/prev-btn.svg" alt="prevMonth" className="w-8 h-8"/></button>
          <h1 className="text-title1-bold text-label-normal">{year}년 {month + 1}월</h1>
          <button onClick={handleNextMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/next-btn.svg" alt="nextMonth" className="w-8 h-8"/></button>
        </div>
        <div className="flex rounded-lg">
          <button className="w-[122px] h-12 rounded-l-xl rounded-r-none border border-line-normal border-r-0" onClick={() => setIsScheduleModalOpen(true)}>+ 일정 등록</button>
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
            // 현재 칸의 날짜 (YYYY-MM-DD)
            const dateStr = CalendarUtils.formatDate(new Date(dateObj.year, dateObj.month, dateObj.day));
            const renderItems = getRenderItems(dateStr, index);

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
                <div className="relative px-2 mt-1">
                  {renderItems.map(({ item, rowIdx, shouldRender }) => {
                    if (!shouldRender) return null;

                    const daysLeftInWeek = 7 - (index % 7);
                    const remainingDays = getRemainingDays(dateStr, item.ends_at);
                    const displayDays = Math.min(daysLeftInWeek, remainingDays);

                    return (
                      <CalendarChip
                       key={'schedule_id' in item ? `s-${item.schedule_id}` : `v-${item.vote_id}`}
                        title={item.title}
                        color={item.color_chip as any}
                        type={'schedule_id' in item ? 'schedule' : 'vote'}
                        isStart={item.starts_at.startsWith(dateStr)}
                        isEnd={remainingDays <= daysLeftInWeek}
                        style={{
                          width: `${CalendarUtils.calculateWidth(displayDays)}px`,
                          position: 'absolute',
                          top: `${rowIdx * 32}px`,
                          zIndex: 20,
                        }}
                      />
                    );
                  })}

                  {/* 3. 모달 컴포넌트 배치 */}
                  <ScheduleRegisterModal 
                    isOpen={isScheduleModalOpen} 
                    onClose={() => setIsScheduleModalOpen(false)} 
                  />
                </div>
                
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}