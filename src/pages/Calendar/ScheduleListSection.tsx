import { ScheduleCard } from "../../components/calendar/ScheduleCard";
import { CalendarUtils, type Schedule } from "../../types/calendar";
import { calendarApi } from "../../api/calendar";
import { useEffect, useState } from "react";
import "./Calendar.css";

export default function ScheduleListSection() {
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const data = await calendarApi.getUpcomingEvents();
        
        // 💡 서버에서 이미 정렬되어 오지만, 안전하게 한 번 더 정렬할 수 있습니다.
        // 백엔드 명세가 startsAt(CamelCase)이므로 이에 맞춰 수정합니다.
        const sortedData = [...data].sort(
          (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        );
        
        setUpcomingSchedules(sortedData);
      } catch (error) {
        console.error("다가오는 일정 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  return (
    <div className="flex flex-col items-start w-[282px] h-[290px] bg-background-neutral border border-line-normal gap-3 py-6 pl-6">
      <h2 className="text-body-1 text-label-normal">일정</h2>

      <div className="w-full flex-1 custom-sidebar-scroll">
        <div className="flex flex-col gap-3">
          {upcomingSchedules.map((schedule) => (
          <ScheduleCard
            key={schedule.eventId}
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