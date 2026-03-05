import { useState } from "react";

interface PaymentSectionProps {
  orgId: number;
  currentDues: any;
  yearlyAmount: any[];
}

export default function PaymentSection({ orgId, currentDues, yearlyAmount }: PaymentSectionProps) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const isUnpaid = currentDues?.myPaymentStatus === "UNPAID";
  const rate = currentDues?.participationRate || 0;


  const handlePrevYear = () => setViewYear(prev => prev - 1);
  const handleNextYear = () => setViewYear(prev => prev + 1);

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
          <div className="flex flex-col gap-3 items-start justify-center w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-3 items-center">
                <span className="text-title-2b text-label-normal">{currentDues?.title}월 회비</span>
                <p className="text-body-1 text-label-neutral">{currentDues?.startDate?.replace(/-/g, '.')} - {currentDues?.endDate?.split('-')[2]}</p>
              </div>

              <div className="flex gap-1 items-center ">
                <span className="text-title-1sb text-label-normal">
                  {currentDues?.totalCollectedAmount?.toLocaleString()}원
                </span>
                <span className="text-body-1 text-label-neutral">
                  {" "}/ {currentDues?.totalTargetAmount?.toLocaleString()}원
                </span>
              </div>

            </div>

            {/* 현황 바 */}
            <div className="relative w-full rounded-full h-2 bg-gray-50 overflow-hidden">
              <div 
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
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
              className="h-[48px] rounded-xl bg-white border border-line-normal px-4 py-3 text-body-1sb text-label-normal whitespace-nowrap"
              // onClick={}
            >
              납부하기
            </button>
          )}
        </div>
      </div>

      {/* 연도별 납부 통계 */}
      <div className="flex flex-col gap-4 items-start justify-center w-full">
        <h2 className="text-title-2b text-label-normal">연도별 회비 납부 통계</h2>
        <div className="w-[1100px] p-5 rounded-xl bg-white flex flex-col gap-5">
          {/* 헤더: 범례 및 연도 선택*/}
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-4">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-caption text-label-neutral">수납액</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-gray-50" />
                <span className="text-caption text-label-neutral">목표액</span>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-[10px] border border-line-normal">
              <button onClick={handlePrevYear} className="rounded-m "><img src="/icons/prev-btn.svg" alt="prevYear" className="w-8 h-8"/></button>
              <h1 className="text-body-1sb text-label-normal">{viewYear}</h1>
              <button onClick={handleNextYear} className="rounded-m "><img src="/icons/next-btn.svg" alt="nextYear" className="w-8 h-8"/></button>
            </div>
          </div>

          {/* 표 */}
          <div className="flex gap-3 items-start justify-between">
      
            {/* 1. Y축 배경 가이드 라인 (수치 및 구분선) */}
            <div className="flex flex-col justify-between items-end text-body-2 text-label-disable w-[49px] h-[296px]">
              {[60000, 45000, 30000, 15000, 0].map((val) => (
                <span key={val}>{val}</span>
              ))}
            </div>

            <div className="flex flex-col gap-3 flex-1">

              {/*  그래프 및 가이드라인 영역*/}
              <div className="relative w-full" style={{ height: '296px' }}>
          
                {/* 배경 가이드 라인 */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-r border-line-normal">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full border-t border-line-normal" />
                  ))}
                </div>

                {/* 막대 그래프 컨테이너 */}
                <div className="absolute inset-0 flex justify-between items-end">
                  {[1, 3, 5, 7, 9, 11].map((m) => {
                    const monthData = yearlyAmount?.find((s: any) => s.month === m);
                    const maxVal = 60000;
                    
                    // 높이를 px 단위로 직접 계산 (전체 296px 기준)
                    const collectedH = monthData ? (monthData.collectedAmount / maxVal) * 296 : 0;
                    const targetH = monthData ? (monthData.targetAmount / maxVal) * 296 : 0;

                    return (
                      <div key={m} className="flex items-end gap-3 px-5 border-l border-line-normal">
                        {/* 수납액 막대 */}
                        <div 
                          className="w-[55px] bg-primary-500" 
                          style={{ height: `${Math.min(collectedH, 295)}px` }} 
                        />
                        {/* 목표액 막대 */}
                        <div 
                          className="w-[55px] bg-gray-50" 
                          style={{ height: `${Math.min(targetH, 295)}px` }} 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* x축 */}
              <div className="flex justify-between w-full">
                {[1, 3, 5, 7, 9, 11].map((m) => (
                  <div key={m} className="flex justify-center w-full"> 
                    <span className="text-body-2 text-label-disable">{m}월</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}