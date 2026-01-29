import VoteNoticeSection from "./VoteNoticeSection"
import VoteListSection from "./VoteListSection"
import ScheduleListSection from "./ScheduleListSection"
import MonthlyCalendar from "./MonthlyCalendar"

export default function CalendarPage () {
  return (
    <div className="flex w-full min-h-screen">
      <aside className="">
        <VoteNoticeSection />
        <ScheduleListSection />
        <VoteListSection />
      </aside>
      <main className= "">
        <MonthlyCalendar />
      </main>
    </div>
  )
}