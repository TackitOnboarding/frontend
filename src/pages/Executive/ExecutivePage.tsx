import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HomeBar from "../../components/HomeBar"
import MainFooter from "../../components/layouts/MainFooter";
import api from "../../api/api";
import DepositSection from "./DepositSection";
import PaymentSection from "./PaymentSection";

type ExecutiveTab = 'DEPOSIT' | 'PAYMENT';

export default function ExecutivePage() {
  const { orgId } = useParams<{ orgId: string }>();
  const numericOrgId = Number(orgId);

  const [activeTab, setActiveTab] = useState<ExecutiveTab>('DEPOSIT');

  const tabConfigs = {
    DEPOSIT: { title: '입출금 내역' },
    PAYMENT: { title: '납부 현황' },
  };

  const [currentDues, setCurrentDues] = useState<any>(null);
  const [yearlyStats, setYearlyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // 1. 현재 회비 납부 현황
      const duesRes = await api.get('/api/accountings/dues', {
        params: { orgId: numericOrgId }
      });
      setCurrentDues(duesRes.data.content); // .content 추가

      // 2. 연도별 회비 납부 통계
      const statsRes = await api.get('/api/accountings/yearly', {
        params: { 
          orgId: numericOrgId, 
          year: new Date().getFullYear() 
        }
      });
      setYearlyStats(statsRes.data.content); // .content 추가
    } catch (err) {
      console.error("납부 데이터 로딩 실패", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (numericOrgId) fetchPaymentData();
  }, [numericOrgId]);

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
            <div className="w-full">
              <DepositSection orgId={numericOrgId} />
            </div>
          ) : (
            <div className="w-full">
              <PaymentSection 
                orgId={numericOrgId} 
                currentDues={currentDues} 
                yearlyAmount={yearlyStats}
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