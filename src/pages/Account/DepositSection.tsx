import { useState } from "react";

export default function DepositSection() {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="flex gap-5 items-start justify-center w-[1100px]">
      {/* 월별 / 등록버튼 */}
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-3 items-center">
          <button onClick={handlePrevMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/prev-btn.svg" alt="prevMonth" className="w-8 h-8"/></button>
          <h1 className="text-title1-bold text-label-normal">{year}년 {month + 1}월</h1>
          <button onClick={handleNextMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/next-btn.svg" alt="nextMonth" className="w-8 h-8"/></button>
        </div>

        <button
          className="flex gap-[6px] items-center px-4 py-3 rounded-xl bg-primary-normal text-white text-body-1sb"
          // onClick={}
        >
          <img src="/icons/add.svg" alt="add" className="w-6 h-6"/>
          내역 등록
        </button>
      </div>

      {/* 현황 및 상세 내역 */}
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        {/* 요약 */}
        <div className="flex gap-8">
          {/* 전체 현황 */}
          <div className="flex flex-col gap-4 items-center justify-center">
            <h2 className="text-title-2b text-label-normal">전체 현황</h2>
            <div className="flex flex-col gap-5">
              {/* 총 자산 & 총 지출 */}
              <div className="flex gap-5 items-center justify-center">
                <div className="flex gap-6 p-6 rounded-xl bg-white">
                  <div className="rounded-xl bg-background-blue w-16 h-16">
                    <img src="/icons/Income.svg" alt="income" className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1 items-start justify-center">
                    <p className="text-body-1 text-label-neutral">총 자산</p>
                    <div>
                      <h2 className="text-title-1b text-label-normal">{}</h2>
                      <p className="text-body-1 text-label-neutral">원</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 p-6 rounded-xl bg-white">
                  <div className="rounded-xl bg-background-blue w-16 h-16">
                    <img src="/icons/Expense.svg" alt="expense" className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1 items-start justify-center">
                    <p className="text-body-1 text-label-neutral">총 지출</p>
                    <div>
                      <h2 className="text-title-1b text-label-normal">{}</h2>
                      <p className="text-body-1 text-label-neutral">원</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 잔액 */}
              <div className="flex gap-6 p-6 rounded-xl bg-white">
                <div className="rounded-xl bg-primary-normal w-16 h-16">
                  <img src="/icons/Inbox.svg" alt="balance" className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1 items-start justify-center">
                    <p className="text-body-1 text-label-neutral">잔액</p>
                    <div>
                      <h2 className="text-title-1b text-label-primary">{}</h2>
                      <p className="text-body-1 text-label-neutral">원</p>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* 카테고리별 지출 */}
          <div className="flex flex-col gap-4 items-center justify-center">
            <h2 className="text-title-2b text-label-normal">카테고리별 지출</h2>
            <div className="flex flex-col gap-4 bg-white p-6 rounded-xl">
              {/* 카테고리 칩 & 바 4개*/}
            </div>
          </div>

        </div>

        {/* 상세 내역 */}
        <div className="flex flex-col gap-4 items-start justify-center">
          <h2 className="text-title-2b text-label-normal">상세 내역</h2>
          {/* 내역 표 */}
          <div>

          </div>

        </div>
      </div>
    </div>
  )
}