import VoteNoticeSection from "./VoteNoticeSection"
import VoteListSection from "./VoteListSection"
import ScheduleListSection from "./ScheduleListSection"
import MonthlyCalendar from "./MonthlyCalendar"
import MainFooter from "../../components/layouts/MainFooter"
// import HomeBar from "../../components/HomeBar"

export default function CalendarPage () {
  return (
    <>
    {/* <HomeBar /> */}
    <div className="flex w-full border border-line-normal">
      <aside className="flex flex-col w-[282px] h-[864px] border-r border-line-normal">
        <div className="w-[282px] px-6 pt-8 pb-6">
          <h1 className="text-title1-bold text-label-normal">캘린더</h1>
        </div>
        <VoteNoticeSection />
        <ScheduleListSection />
        <VoteListSection />
      </aside>
      <main className="">
        <MonthlyCalendar />
      </main>
    </div>
    <MainFooter />
    </>
  )
}