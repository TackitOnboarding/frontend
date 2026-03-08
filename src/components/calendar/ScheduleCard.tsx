import { CalendarUtils, type Schedule } from "../../types/calendar";
import { CardVariant } from "./CardVariants";

interface ScheduleCardProps {
  data: Schedule;
}

export const ScheduleCard = ({ data }: ScheduleCardProps) => {
  const now = new Date();
  const startDate = new Date(data.startsAt);
  const endDate = new Date(data.endsAt);
  
  // 1. 당일 일정 여부 확인
  const isSingleDay = CalendarUtils.isSameDay(startDate, endDate);

  // 2. 날짜 라벨 렌더링 함수
  const renderDateLabel = () => {
    if (isSingleDay) {
      // 하루짜리 일정: 2026.02.02(월) 17:00
      return CalendarUtils.formatDetailDate(data.startsAt);
    } else {
      // 며칠에 걸친 일정: 시작일 - 종료일 (시간 제외)
      // starts_at과 ends_at에서 "T" 이전의 날짜 부분만 추출하여 포맷팅
      const startFormatted = CalendarUtils.formatDetailDate(data.startsAt).split(' ')[0];
      const endFormatted = CalendarUtils.formatDetailDate(data.endsAt).split(' ')[0];
      
      return (
        <span className="block leading-tight">
          {startFormatted} - <br />
          {endFormatted}
        </span>
      );
    }
  };

  const dDay = CalendarUtils.getDiffDays(data.startsAt, now);
  const isToday = CalendarUtils.isSameDay(startDate, now);
  const status = isToday ? "today" : "default";

  // 칩 색상 클래스 매핑 (CalendarChip의 color 베리언트와 동일하게 맞춤)
  const chipColorClass = {
    blue: "bg-chip-blue",
    gray: "bg-chip-gray",
    pink: "bg-chip-pink",
    orange: "bg-chip-orange",
    green: "bg-chip-green",
  }[data.colorChip as string] || "bg-label-disable"; // 기본값 설정

  return (
    <div className={CardVariant({ status })}>
        <div className="flex justify-between items-center w-[202px]">
          <div className="flex flex-col items-start gap-[2px]">
            <p className="text-caption-regular text-label-neutral">{renderDateLabel()}</p>
            <div className="flex gap-2 items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${chipColorClass}`} />
              <p className="text-body-1sb text-label-normal">{data.title}</p>
            </div>
            
          </div>

          <div className={`px-2 py-1 rounded-[8px] text-bold-2 ${
            isToday ? 'bg-interaction-normal text-label-inverse' : 'bg-background-blue text-label-primary'
            }`}>
            {dDay === 0 ? "D-day" : dDay > 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`}
          </div>
        </div>
      </div>
  )
}