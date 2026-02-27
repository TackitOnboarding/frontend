import { useState } from "react";
import HomeBar from "../../components/HomeBar"
import MainFooter from "../../components/layouts/MainFooter";
import DepositSection from "./DepositSection";
import PaymentSection from "./PaymentSection";

type ExecutiveTab = 'DEPOSIT' | 'PAYMENT';

export default function ExecutivePage() {
  const mockCurrentDues = {
    duesId: 1,
    title: "1월 회비",
    startDate: "2026-01-01",
    endDate: "2026-01-10",
    participationRate: 67,
    totalCollectedAmount: 40000,
    totalTargetAmount: 60000,
    unpaidCount: 4,
    myPaymentStatus: "UNPAID", // 'PAID'로 바꾸면 파란색 UI로 변합니다
  };

  const mockYearlyStats = [
    { month: 1, collectedAmount: 62000, targetAmount: 60000 },
    { month: 3, collectedAmount: 58000, targetAmount: 60000 },
    { month: 5, collectedAmount: 60000, targetAmount: 60000 },
    { month: 7, collectedAmount: 50000, targetAmount: 60000 },
    { month: 9, collectedAmount: 60000, targetAmount: 60000 },
  ];

  const [activeTab, setActiveTab] = useState<ExecutiveTab>('DEPOSIT');

  const tabConfigs = {
    DEPOSIT: { title: '입출금 내역' },
    PAYMENT: { title: '납부 현황' },
  };

  return (
    <>
    <HomeBar />
    <div className="flex w-full bg-background-neutral px-[170px] pt-8 pb-10 items-center justify-center">
      <div className="flex flex-col gap-5 items-start justify-center">

        {/* 메뉴 바 */}
        <div className="flex gap-5">
          {(Object.keys(tabConfigs) as ExecutiveTab[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`pb-3 transition-all text-title1-bold ${
                activeTab === type 
                  ? 'text-label-normal ' // 활성 상태
                  : 'text-label-disable ' // 비활성 상태
              }`}
            >
              {tabConfigs[type].title}
            </button>
          ))}
        </div>

        <div className="w-full flex justify-center items-center">
          {activeTab === 'DEPOSIT' ? (
            <div className="w-full">{ <DepositSection /> }</div>
          ) : (
            <div className="w-full">{ <PaymentSection currentDues={mockCurrentDues} 
        yearlyAmount={mockYearlyStats}/> }</div>
          )}
        </div>
      </div>
    </div>
    <MainFooter />
    </>
  )
}