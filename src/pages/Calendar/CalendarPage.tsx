import VoteNoticeSection from "./VoteNoticeSection"
import VoteListSection from "./VoteListSection"
import ScheduleListSection from "./ScheduleListSection"
import MonthlyCalendar from "./MonthlyCalendar"
import MainFooter from "../../components/layouts/MainFooter"
import HomeBar from "../../components/HomeBar"

export default function CalendarPage () {
  return (
    <>
    {/* <HomeBar /> */}
    <div className="flex w-full">
      <aside className="">
        <VoteNoticeSection />
        <ScheduleListSection />
        <VoteListSection />
      </aside>
      <main className= "">
        <MonthlyCalendar />
      </main>
    </div>
    <MainFooter />
    </>
  )
}