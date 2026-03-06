import { useState, useEffect } from "react";
import { toastError, toastSuccess } from '../../utils/toast'
import MemberPaymentCard from "../../components/management/MemberPaymentCard";
import { MemberStatus } from "../../types/member";
import { DuesRegisterModal } from "../../components/management/DuesRegisterModal";

interface MonthlyDues {
  duesId: number;
  title: string;
  startDate: string;
  endDate: string;
  targetAmount: number;
  collectedAmount: number;
  totalMemberCount: number;
  paidMemberCount: number;
  members: MemberStatus[];
}


export default function ExecutiveManageSection () {
  const [viewDate, setViewDate] = useState(new Date());
  const [duesList, setDuesList] = useState<MonthlyDues[]>([]);
  const [isDuesModalOpen, setIsDuesModalOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const fetchMonthlyDues = async () => {
    try {
      const response = await fetch(`/api/executive/dues/monthly?orgId=3&year=${year}&month=${month + 1}`);
      const data = await response.json();

      if (response.ok) {
        setDuesList(data.content || []);
      } else {
        toastError(data.status.message || "데이터 조회 실패");
      }
    } catch (e) {
      toastError("네트워크 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchMonthlyDues();
  }, [viewDate]);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // 납부 상태 변경
  const handleStatusChange = async (duesId: number, memberOrgId: number, currentStatus: string) => {
  const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';

  try {
    const response = await fetch(`/api/executive/dues/${duesId}/members/${memberOrgId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentStatus: newStatus }),
    });

    const data = await response.json();

    if (response.ok) {
      toastSuccess("납부 상태가 변경되었습니다.");
      fetchMonthlyDues();
    } else {
      toastError(data.status.message || "상태 변경 실패");
    }
  } catch (e) {
    toastError("네트워크 오류가 발생했습니다.");
  }
};

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-title1-bold text-label-normal">회비 관리</h1>
        <button
          type="button"
          onClick={() => setIsDuesModalOpen(true)}
          className="flex px-4 py-3 bg-primary-500 rounded-xl gap-[6px]"
        >
          <img src="/icons/add.svg" alt="add" className="w-6 h-6" />
          <p className="text-body-1sb text-white">회비 등록</p>
        </button>
      </div>

      {/* 월별 조회 버튼 */}
      <div className="flex items-center justify-center w-[141px] rounded-[10px] border border-line-normal bg-white">
        <button onClick={handlePrevMonth} className="rounded-m "><img src="/icons/prev-btn.svg" alt="prevYear" className="w-8 h-8"/></button>
        <h1 className="text-body-1sb text-label-normal">{year}.{month + 1}</h1>
        <button onClick={handleNextMonth} className="rounded-m "><img src="/icons/next-btn.svg" alt="nextYear" className="w-8 h-8"/></button>
      </div>

      {/* 회비 */}
      <div className="flex flex-col gap-10">
        {duesList.length > 0 ? (
          // 데이터가 있을 때의 리스트
        
        duesList.map((dues) => {
          const rate = (dues.collectedAmount / dues.targetAmount) * 100;

          return (
            <div key={dues.duesId} className="flex flex-col rounded-lg bg-white">

              <div  className="flex flex-col px-6 py-8 gap-3 border-b border-line-normal w-full ">

                <div className="flex gap-3 items-center justify-between">

                  <div className="flex gap-3 items-center justify-start w-full">
                    <span className="text-title-2b text-label-normal">{dues.title}</span>
                    <p className="text-body-1 text-label-neutral">
                      {dues.startDate.replace(/-/g, '.')} - {dues.endDate.split('-')[1]}.{dues.endDate.split('-')[2]}
                    </p>
                  </div>

                  <div className="flex gap-1 items-center ">
                    <span className="text-title-1sb text-label-normal whitespace-nowrap">
                      {dues.collectedAmount.toLocaleString()}원
                    </span>
                    <span className="text-body-1 text-label-neutral whitespace-nowrap">
                        / {dues.targetAmount.toLocaleString()}원
                    </span>
                  </div>  
                </div>

                {/* 현황 바 */}
                <div className="relative w-full rounded-full h-2 bg-gray-50 overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>

              {/* 회원별 납부 현황 그리드 */}
              <div className="flex flex-col p-6 gap-4">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-title-2b text-label-normal">회원별 납부 현황</h3>
                  <span className="text-body-1 text-label-neutral">
                    <b className="text-body-1sb text-label-normal">{dues.paidMemberCount}명</b> / {dues.totalMemberCount}명 납부
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {dues.members.map((member) => (
                    <MemberPaymentCard 
                      key={member.memberOrgId}
                      member={member}
                      duesId={dues.duesId}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  
                </div>

              </div>
            </div>
          )})
        ): (
          // 데이터가 없을 때
          <>      
            {/* 회비 */}
            <div className="flex flex-col rounded-lg bg-white">
              <div  className="flex flex-col px-6 py-8 gap-3 border-b border-line-normal w-full ">
                  <div className="flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center justify-start w-full">
                    {/* 현재 보고 있는 월을 제목에 반영 */}
                    <span className="text-title-2b text-label-normal">{month + 1}월 회비</span>
                    <p className="text-body-1 text-label-neutral">
                      {year}.{String(month + 1).padStart(2, '0')}.01 - {String(month + 1).padStart(2, '0')}.10
                    </p>
                  </div>

                  <div className="flex gap-1 items-center">
                    <span className="text-title-1sb text-label-normal whitespace-nowrap">0원</span>
                    <span className="text-body-1 text-label-neutral whitespace-nowrap">/ 0원</span>
                  </div>
                </div>

                {/* 0% 상태의 현황 바 */}
                <div className="relative w-full rounded-full h-2 bg-gray-50 overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-primary-500 w-0 transition-all duration-700" />
                </div>
              </div>

              {/* 하단 회원 현황 영역 틀 유지 */}
              <div className="flex flex-col p-6 gap-4 bg-background-secondary">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-title-2b text-label-normal">회원별 납부 현황</h3>
                  <span className="text-body-1 text-label-neutral">
                    <b className="text-body-1sb text-label-normal">0명</b> / 0명 납부
                  </span>
                </div>
                
                {/* 안내 문구 중심 배치 */}
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-line-normal rounded-xl bg-white">
                  <p className="text-body-2 text-label-assistive">등록된 회비 내역이 없습니다.</p>
                  <p className="text-caption text-label-assistive">상단의 버튼을 눌러 회비를 등록해 보세요!</p>
                </div>
              </div>
            </div>

            {/* 회식비 */}
              <div className="flex flex-col rounded-lg bg-white">
              <div  className="flex flex-col px-6 py-8 gap-3 border-b border-line-normal w-full ">
                  <div className="flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center justify-start w-full">
                    {/* 현재 보고 있는 월을 제목에 반영 */}
                    <span className="text-title-2b text-label-normal">{month + 1}월 회식비</span>
                    <p className="text-body-1 text-label-neutral">
                      {year}.{String(month + 1).padStart(2, '0')}.01 - {String(month + 1).padStart(2, '0')}.10
                    </p>
                  </div>

                  <div className="flex gap-1 items-center">
                    <span className="text-title-1sb text-label-normal whitespace-nowrap">0원</span>
                    <span className="text-body-1 text-label-neutral whitespace-nowrap">/ 0원</span>
                  </div>
                </div>

                {/* 0% 상태의 현황 바 */}
                <div className="relative w-full rounded-full h-2 bg-gray-50 overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-primary-500 w-0 transition-all duration-700" />
                </div>
              </div>

              {/* 하단 회원 현황 영역 틀 유지 */}
              <div className="flex flex-col p-6 gap-4 bg-background-secondary">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-title-2b text-label-normal">회원별 납부 현황</h3>
                  <span className="text-body-1 text-label-neutral">
                    <b className="text-body-1sb text-label-normal">0명</b> / 0명 납부
                  </span>
                </div>
                
                {/* 안내 문구 중심 배치 */}
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-line-normal rounded-xl bg-white">
                  <p className="text-body-2 text-label-assistive">등록된 회비 내역이 없습니다.</p>
                  <p className="text-caption text-label-assistive">상단의 버튼을 눌러 회비를 등록해 보세요!</p>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
        <DuesRegisterModal 
          isOpen={isDuesModalOpen} 
          onClose={() => setIsDuesModalOpen(false)} 
          onSuccess={fetchMonthlyDues}
        />
    </div>
  )
}