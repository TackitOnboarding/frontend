import { ScheduleCard } from "../../components/calendar/ScheduleCard";
import { CalendarUtils, type Schedule } from "../../types/calendar";
import "./Calendar.css";

const mockSchedules: Schedule[] = [
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

export default function ScheduleListSection() {
  const now = new Date();

  // 1. 오늘 이후 일정 필터링 및 가까운 날짜순 정렬
  const upcomingSchedules = mockSchedules
    .filter(s => {
      const dDay = CalendarUtils.getDiffDays(s.starts_at, now); //
      return dDay >= 0; // 오늘 포함 미래 일정만
    })
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  return (
    <div className="flex flex-col items-start w-[282px] h-[290px] bg-background-neutral border border-line-normal gap-3 py-6 pl-6">
      <h2 className="text-body-1 text-label-normal">일정</h2>

      <div className="w-full flex-1 custom-sidebar-scroll">
        <div className="flex flex-col gap-3">
          {upcomingSchedules.map((schedule) => (
          <ScheduleCard
            key={schedule.schedule_id}
            data={schedule}
          />
        ))}
        {upcomingSchedules.length === 0 && (
            <p className="text-body-2 text-label-disable py-4 text-center">예정된 일정이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}