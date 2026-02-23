import { useState } from "react";
// import HomeBar from "../../components/HomeBar"
import MainFooter from "../../components/layouts/MainFooter";

type AccountTab = 'DEPOSIT' | 'PAYMENT';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>('DEPOSIT');

  const tabConfigs = {
    DEPOSIT: { title: '입출금 내역' },
    PAYMENT: { title: '납부 현황' },
  };

  return (
    <>
    {/* <HomeBar /> */}
    <div className="flex w-full bg-background-neutral px-[170px] pt-8 pb-10 items-center justify-center">
      <div className="flex gap-5 items-start justify-center">

        {/* 메뉴 바 */}
        <div className="flex gap-5">
          {(Object.keys(tabConfigs) as AccountTab[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`pb-3 transition-all text-title-1b ${
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
            <div className="w-full">{/* <DepositSection /> 입출금 내역 컴포넌트 */}</div>
          ) : (
            <div className="w-full">{/* <PaymentSection /> 납부 현황 컴포넌트 */}</div>
          )}
        </div>
      </div>
    </div>
    <MainFooter />
    </>
  )
}