import { useEffect, useState } from "react";
import HomeBar from "../../components/HomeBar"
import MainFooter from "../../components/layouts/MainFooter";
import api from "../../api/api";
import DepositSection from "./DepositSection";
import PaymentSection from "./PaymentSection";

type AccountTab = 'DEPOSIT' | 'PAYMENT';

export default function AccountPage() {

  const [activeTab, setActiveTab] = useState<AccountTab>('DEPOSIT');

  const tabConfigs = {
    DEPOSIT: { title: '입출금 내역' },
    PAYMENT: { title: '납부 현황' },
  };

  const [currentDues, setCurrentDues] = useState<any>(null);
  const [yearlyStats, setYearlyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeProfileId = localStorage.getItem('activeProfileId');

  const fetchInitialData = async () => {
    if (!activeProfileId) return;
    try {
      setLoading(true);
      const duesRes = await api.get('/api/accountings/dues', {
        headers: { 'Active-Profile-Id': activeProfileId }
      });
      setCurrentDues(duesRes.data.content);

      // 초기 진입 시 올해 통계도 함께 로드
      await fetchYearlyStats(new Date().getFullYear());
    } catch (err) {
      console.error("초기 데이터 로드 실패", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyStats = async (year: number) => {
    if (!activeProfileId) return;
    try {
      const statsRes = await api.get('/api/accountings/yearly', {
        params: { year },
        headers: { 'Active-Profile-Id': activeProfileId }
      });
      setYearlyStats(statsRes.data.content || []);
    } catch (err) {
      console.error(`${year}년 통계 로드 실패`, err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [activeProfileId]);

  return (
    <>
    <HomeBar />
    <div className="flex w-full bg-background-neutral px-[170px] pt-8 pb-10 items-center justify-center">
      <div className="flex flex-col gap-5 items-start justify-center">

        {/* 메뉴 바 */}
        <div className="flex gap-5">
          {(Object.keys(tabConfigs) as AccountTab[]).map((type) => (
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
            <div className="w-full">
              <DepositSection />
            </div>
          ) : (
            <div className="w-full">
              <PaymentSection 
                currentDues={currentDues} 
                yearlyAmount={yearlyStats}
                onYearChange={fetchYearlyStats}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    <MainFooter />
    </>
  )
}