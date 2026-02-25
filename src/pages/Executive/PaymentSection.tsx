import { useState } from "react";

interface PaymentSectionProps {
  currentDues: any;
  yearlyAmount: any;
}

export default function PaymentSection({ currentDues, yearlyAmount }: PaymentSectionProps) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const isUnpaid = currentDues?.myPaymentStatus === "UNPAID";
  const rate = currentDues?.participationRate || 0;

  return (
    <div className="flex flex-col gap-5 w-[1100px]">
      {/* 회비 미납 시 알림 배너 */}
      {isUnpaid && (
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center text-system-negative">
            <img src="/icons/info.svg" alt="warning" className="w-5 h-5"/>
            <span className="text-body-1sb">회비 납부가 진행 중이에요</span>
          </div>
          <p className="text-body-2 text-label-normal">모임 운영을 위해 이번 달 회비를 납부해주세요.</p>
        </div>
      )}

      {/* 현황 */}
      <div className={`flex flex-col px-6 py-8 gap-3 border rounded-xl bg-white w-full transition-all ${
        isUnpaid ? 'border-line-negative' : 'border-line-active '
      }`}>
        <div className="flex gap-8 items-center justify-between">
          <div className="flex flex-col gap-3 items-start justify-center">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <span className="text-title-2b text-label-normal">{currentDues?.title}월 회비</span>
                <p className="text-body-1 text-label-neutral">{currentDues?.startDate?.replace(/-/g, '.')} - {currentDues?.endDate?.split('-')[2]}</p>
              </div>

              <div className="flex gap-1 items-center">
                <span className="text-title-1sb text-label-normal">
                  {currentDues?.totalCollectedAmount?.toLocaleString()}원
                </span>
                <span className="text-body-1 text-label-neutral">
                  {" "}/ {currentDues?.totalTargetAmount?.toLocaleString()}원
                </span>
              </div>

            </div>

            {/* 현황 바 */}
            <div className="relative w-full rounded-full h-2 bg-primary-disable overflow-hidden">
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-700 ${
                  isUnpaid ? 'bg-line-negative' : 'bg-line-active'
                }`}
                style={{ width: `${rate}%` }}
              />
            </div>

            {/* 참여울 & 미납 인원 */}
            <div className="flex justify-between items-center w-full">
              <span className="text-body-1 text-label-neutral">
                참여율 <span className="text-body-1sb text-label-normal">{rate}%</span>
              </span>
              <span className="text-body-1 text-label-neutral">
                미납 인원 <span className="text-body-1sb text-line-negative">{currentDues?.unpaidCount}명</span>
              </span>
            </div>

          </div>
          {isUnpaid && (
            <button 
              className="w-22 h-12 rounded-xl bg-white border border-line-normal px-4 py-3 text-body-1sb text-label-normal"
              // onClick={}
            >
              납부하기
            </button>
          )}
        </div>
      </div>

      {/* 연도별 납부 통계 */}
      <div className="flex flex-col gap-4 items-start justify-center w-full">

      </div>
    </div>
  )
}