import { useState } from "react";

interface PaymentSectionProps {
  currentDues: any;
  yearlyAmount: any;
}

export default function PaymentSection({ currentDues, yearlyAmount }: PaymentSectionProps) {
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
          <div className="relative h-[328px] w-full pl-16 pr-8 flex items-end justify-between">
      
            {/* 1. Y축 배경 가이드 라인 (수치 및 구분선) */}
            <div 
              className="absolute left-4 right-8 pointer-events-none flex flex-col justify-between" 
              style={{ height: '296px' }}
            >
              {[60000, 45000, 30000, 15000, 0].map((val) => (
                <div key={val} className="flex items-center gap-4 w-full">
                  <span className="text-body-2 text-label-disable w-12 text-right">
                    {val.toLocaleString()}
                  </span>
                  <div className="flex-1 border-t border-line-normal opacity-40" />
                </div>
              ))}
            </div>

            {/* 2. 월별 막대 그래프 데이터 매핑 (홀수 월 기준) */}
            {[1, 3, 5, 7, 9].map((m) => {
              // 명세서 데이터(yearlyStats)에서 해당 월의 데이터를 찾음
              const monthData = yearlyAmount?.find((s: any) => s.month === m);
              
              // Y축 최대값(60,000원) 대비 높이 비율 계산
              const maxVal = 60000;
              const collectedH = monthData ? (monthData.collectedAmount / maxVal) * 296 : 0;
              const targetH = monthData ? (monthData.targetAmount / maxVal) * 296 : 0;

              return (
                <div key={m} className="relative flex flex-col items-center z-10 px-10 ">
                  {/* 막대 그룹 (수납액 & 목표액) */}
                  <div className="flex items-end gap-1.5 mb-[22px]" style={{ height: '296px' }}>
                    {/* 수납액 막대 (파란색)  */}
                    <div 
                      className="w-[60px] bg-primary-500 rounded-t-sm transition-all duration-1000 ease-out shadow-sm" 
                      style={{ height: `${Math.min(collectedH, 100)}%` }}
                    />
                    {/* 목표액 막대 (연회색) */}
                    <div 
                      className="w-[60px] bg-gray-50 rounded-t-sm transition-all duration-1000 ease-out" 
                      style={{ height: `${Math.min(targetH, 100)}%` }}
                    />
                  </div>
                  
                  {/* X축 월 텍스트 표시 */}
                  <span className="text-body-2 text-label-disable absolute bottom-0 leading-[32px]">{m}월</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  )
}