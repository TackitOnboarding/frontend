import { useEffect, useState } from "react";
import api from "../../api/api";
import Chip from "../../components/Chip";
import SummaryCard from "../../components/executive/SummaryCard"
import { PayModal } from "../../components/executive/PayModal";

export default function DepositSection({ orgId }: { orgId: number }) {

  const categoryMap: any = {
    FOOD: { label: "식비", color: "bg-chip-blue" },
    STUFF: { label: "사무용품", color: "bg-chip-pink" },
    EVENT: { label: "행사", color: "bg-chip-orange" },
    ETC: { label: "기타", color: "bg-chip-green" },
  };

  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const fetchMonthlyStatus = async () => {
    const apiMonth = viewDate.getMonth() + 1;

    try {
      // 1. 월별 현황 및 지출 통계 조회
      const statusRes = await api.get('/accountings/monthly/status', {
        params: { orgId, year, month: apiMonth}
      });

      // 2. 상세 내역 리스트 조회
      const listRes = await api.get('/api/accountings/monthly', {
        params: { orgId, year, month: apiMonth }
      });
      
      setData(statusRes.data.content); 
      setTransactions(listRes.data.content || []); 
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setData(null);
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (orgId) fetchMonthlyStatus();
  }, [orgId, viewDate]);

  const totalExpense = data?.totalExpense || 0;

  return (
    <div className="flex flex-col gap-5 w-[1100px]">
      {/* 월별 / 등록버튼 */}
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-3 items-center">
          <button onClick={handlePrevMonth} className="bg-white rounded-[10px] border border-line-normal"><img src="/icons/prev-btn.svg" alt="prevMonth" className="w-8 h-8"/></button>
          <h1 className="text-title1-bold text-label-normal">{year}년 {month + 1}월</h1>
          <button onClick={handleNextMonth} className="bg-white rounded-[10px] border border-line-normal"><img src="/icons/next-btn.svg" alt="nextMonth" className="w-8 h-8"/></button>
        </div>

        <button
          className="flex gap-[6px] items-center px-4 py-3 rounded-xl bg-primary-500 text-white text-body-1sb"
          onClick={() => setIsPayModalOpen(true)}
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
          <div className="flex flex-col gap-4 items-start justify-center">
            <h2 className="text-title-2b text-label-normal">전체 현황</h2>
            <div className="flex flex-col justify-between w-[540px] h-[268px]">
              {/* 총 자산 & 총 지출 */}
              <div className="flex gap-5 items-center justify-between">
                <SummaryCard
                  title="총 자산"
                  amount={data?.totalIncome || 0}
                  icon="/icons/Income.svg"
                  bg="bg-background-blue"
                />

                <SummaryCard
                  title="총 지출"
                  amount={data?.totalExpense || 0}
                  icon="/icons/Expense.svg"
                  bg="bg-background-blue"
                />
              </div>

              {/* 잔액 */}
              <SummaryCard
                title="잔액"
                amount={(data?.balance) || 0}
                icon="/icons/Inbox.svg"
                bg="bg-primary-500"
                isBalance
              />
            </div>
          </div>

          {/* 카테고리별 지출 */}
          <div className="flex flex-col gap-4 items-start justify-center">
            <h2 className="text-title-2b text-label-normal">카테고리별 지출</h2>
            <div className="flex flex-col gap-4 bg-white p-6 rounded-xl w-[540px] h-[268px]">
              {/* 카테고리 칩 & 바 4개*/}
              {data?.categoryStats?.map((item: any) => {
                const config = categoryMap[item.category];
                const ratio = totalExpense > 0 ? (item.amount / totalExpense) * 100: 0;
                return (
                  <div key={item.category} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${config.color}`} />
                        <span className="text-body-1sb text-label-normal">
                          {config.label}
                        </span>
                      </div>
                      <span className="text-body-1sb text-label-normal">
                        {item.amount.toLocaleString()}원
                      </span>
                    </div>

                    {/* chart Bar */}
                    <div className="relative w-full h-2 rounded-full bg-gray-50 overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 transition-all duration-500 ${config.color}`}
                        style={{ width: `${ratio}%`}}
                      />
                    </div>
                  </div>
                )
              })}
              {(!data?.categoryStats || data.categoryStats.length === 0) && (
                <div className="flex items-center justify-center h-full text-label-assistive text-body-2">통계 데이터가 없습니다.</div>
              )}
            </div>
          </div>

        </div>

        {/* 상세 내역 */}
        <div className="flex flex-col gap-4 items-start justify-center">
          <h2 className="text-title-2b text-label-normal">상세 내역</h2>
          {/* 내역 표 */}
          <div className="w-[1100px] rounded-t-xl bg-white overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_2fr_1fr] bg-gray-100 px-4 py-3 border-b-[0.5px] border-line-normal">
              {["가맹점명", "날짜", "카테고리", "상세 설명", "금액"].map((header) => (
                <span key={header} className="text-body-2 text-label-neutral">
                  {header}
                </span>
              ))}
            </div>

            {/* 표 바디 */}
            <div className="flex flex-col">
              {transactions?.map((item: any) => {
                const isExpense = item.transactionType === "EXPENSE";
                
                return (
                  <div 
                    key={item.transactionId} 
                    className="grid grid-cols-[1.5fr_1fr_1fr_2fr_1fr] px-4 py-3 border-b-[0.5px] border-line-normal items-center"
                  >
                    {/* 가맹점명 */}
                    <span className="text-body-1sb text-label-normal pr-4">
                      {item.storeName}
                    </span>

                    {/* 날짜 */}
                    <span className="text-body-1 text-label-neutral">
                      {item.transactionDate.replace(/-/g, ".")}
                    </span>

                    <div>
                      <Chip 
                        label={item.category.name} 
                        selected={false}
                        // className="h-8 min-w-[54px] px-2 text-caption-sb !bg-blue-50 !text-chip-blue" 
                      />
                    </div>

                    {/* 상세 설명 */}
                    <span className="text-body-1 text-label-neutral pr-4">
                      {item.description || "-"}
                    </span>

                    {/* 금액 */}
                    <span className={`text-body-1sb text-right ${isExpense ? "text-line-negative" : "text-line-active"}`}>
                      {isExpense ? "-" : "+"} ₩{item.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-20 text-label-assistive text-body-1">
                  해당 월의 거래 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 내역 등록 모달 */}
      <PayModal 
        isOpen={isPayModalOpen} 
        onClose={() => {
          setIsPayModalOpen(false);
        }} 
        orgId={orgId} 
      />
    </div>
  )
}