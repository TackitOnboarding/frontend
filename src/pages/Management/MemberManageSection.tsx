import { useState, useEffect } from "react";
import { toastError, toastSuccess } from '../../utils/toast'
import Modal from "../../components/modals/Modal";
import StatusBadge from "../../components/management/StatusBadge";
import Pagination from "../../components/Pagination";

type OrgStatus = "ALL" | "PENDING" | "ACTIVE" | "INACTIVE";

// const BADGE_ICONS = {
//   ADMIN: '/icons/executive.svg',   // 운영진
//   SENIOR: '/icons/senior.svg', // 선배
//   NEWBIE: '/icons/newbie.svg', // 신입
// } as const;

// const BadgeInfo = (role: string, type: string) => {
//   if (role === 'ADMIN') return { src: BADGE_ICONS.ADMIN, label: '운영진' };
//   if (type === 'SENIOR') return { src: BADGE_ICONS.SENIOR, label: '선배' };
//   if (type === 'NEWBIE') return { src: BADGE_ICONS.NEWBIE, label: '신입' };
//   return null;
// };

interface Member {
  memberId: number;
  nickname: string;
  email: string;
  orgStatus: OrgStatus;
  createdAt: string;
}

export default function MemberManageSection () {
  const [activeFilter, setActiveFilter] = useState<OrgStatus>("ALL");
  const [members, setMembers] = useState<Member[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1)
  const size = 10

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    action: '' as 'approve' | 'reject',
    memberId: 0,
    title: '',
  })

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams();
    if (activeFilter !== "ALL") params.append("orgStatus", activeFilter);
    params.append("page", String(currentPage));
    params.append("size", "10");

    const response = await fetch(`/api/executive/members?${params.toString()}`);
    const data = await response.json();
      setMembers(data);
       setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))

    } catch (e) {
      toastError("목록을 불러오는 중 오류가 발생했습니다.");
      setTotalPages(1)
    }
  };

  useEffect(() => { fetchMembers(); }, [activeFilter, currentPage]);

  const openConfirmModal = (action: 'approve' | 'reject', memberId: number, nickname: string) => {
    setModalConfig({
      action,
      memberId,
      title: action === 'approve' ? `${nickname}님을 승인하시겠습니까?` : `${nickname}님을 거부하시겠습니까`,
    })
    setIsModalOpen(true);
  }

  const handleConfirmAction = async () => {
    const { action, memberId } = modalConfig;
    setIsModalOpen(false);

    try {
      const response = await fetch(`/api/executive/members/${action}?memberOrgId=${memberId}`, {
        method: 'POST',
      });

      if (response.ok) {
        // 성공 토스트 호출
        toastSuccess(action === 'approve' ? "성공적으로 승인되었습니다." : "반려 처리가 완료되었습니다.");
        fetchMembers(); 
      } else {
        // 실패 토스트 호출
        toastError("요청 처리에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      toastError("네트워크 연결을 확인해주세요.");
    }
  };

  // 필터링된 데이터
  const filteredMembers = activeFilter === "ALL" 
    ? members 
    : members.filter(m => m.orgStatus === activeFilter);

  return (
    <div className="w-full flex flex-col gap-10">
      {/* 탭 */}
      <div className="flex gap-3">
        {[
          { label: "전체", value: "ALL" },
          { label: "대기", value: "PENDING" },
          { label: "사용중", value: "ACTIVE" },
          { label: "비활성화", value: "INACTIVE" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value as OrgStatus)}
            className={`px-3 py-2 rounded-lg h-10 text-body-1 ${
              activeFilter === tab.value
                ? "bg-background-active text-label-inverse"
                : "bg-white text-label-normal"
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>
      {/* 표 */}
      <div className="w-full flex flex-col px-6 pt-10 pb-4 bg-white rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="flex bg-background-neutral text-label-neutral text-body-2 px-4 py-3 gap-4 rounded-t-lg">
            <tr>
              <th className="w-[135.5px] text-left">닉네임</th>
              <th className="w-[400px] text-left">이메일</th>
              <th className="w-[135.5px] text-left">상태</th>
              <th className="w-[135.5px] text-left">가입일</th>
              <th className="w-[135.5px] text-left">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-normal h-[600px] rounded-b-lg">
            {members.map((member) => (
              <tr key={member.memberId} className="px-4 py-3 text-body-1 text-label-normal border-b border-line-normal h-[60px]">
                {/* 닉네임: 시안처럼 이름 뒤에 이모지(아이콘) 배치 */}
                <td className="flex gap-[2px]">
                  {member.nickname}
                  {/* {badge && (
                    <img 
                      src={badge.src} 
                      alt={badge.label}
                      title={badge.label} // 마우스 호버 시 툴팁
                      className="w-4 h-4 object-contain" 
                    />
                  )} */}
                </td>

                {/* 이메일 */}
                <td>
                  {member.email}
                </td>

                {/* 상태: 공통 StatusBadge 컴포넌트 활용 */}
                <td >
                  <StatusBadge status={member.orgStatus} />
                </td>

                {/* 가입일: 2025.06.20 형식으로 변환 */}
                <td>
                  {member.createdAt.split('T')[0].replaceAll('-', '.')}
                </td>

                {/* 작업: PENDING 상태일 때만 버튼 노출 */}
                <td className="">
                  {member.orgStatus === 'PENDING' ? (
                    <div className="flex items-center gap-[10px]">
                      <button 
                        onClick={() => openConfirmModal('approve', member.memberId, member.nickname)}
                        className="px-3 py-2 border border-line-normal rounded-m text-body-2sb text-label-normal bg-white"
                      >
                        승인
                      </button>
                      <button 
                        onClick={() => openConfirmModal('reject', member.memberId, member.nickname)}
                        className="px-3 py-2 border border-line-normal rounded-m text-body-2sb text-label-normal bg-white"
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <span className="text-label-neutral text-body-1">-</span>
                  )}
                </td>
              </tr>
            ))}

            {/* 데이터가 없을 경우 처리 */}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-label-neutral text-body-2">
                  조회된 회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-center mt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages} // 데이터 양에 따라 계산된 값
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
          />
        </div>     
      </div>
      <Modal
        open={isModalOpen}
        title={modalConfig.title}
        cancelText="취소"
        confirmText="네"
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}