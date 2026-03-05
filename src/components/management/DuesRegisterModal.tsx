import { useState, useEffect } from 'react';
import { toastError, toastSuccess } from '../../utils/toast'
import { RegisterModal } from "../modals/RegisterModal";
import { Button } from '../ui/Button';
import { MiniCalendar } from '../calendar/MiniCalendar';

interface OrgMember {
  orgMemberId: number;
  nickname: string;
  profileImageUrl: string | null;
  memberRole: string;
  memberType: string;
}

interface DuesRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId?: number;
  onSuccess: () => void;
}

export const DuesRegisterModal = ({ isOpen, onClose, orgId, onSuccess }: DuesRegisterModalProps) => {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [openDropdown, setOpenDropdown] = useState<'startDate' | 'endDate' | 'member' | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    amount: "",
    selectedMemberIds: [] as number[],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        try {
          const response = await fetch(`/api/orgs/${orgId}/members`);
          const data = await response.json();
          if (response.ok) {
            setMembers(data.content);
            // 초기값은 전체 선택으로 세팅
            setFormData(prev => ({ 
              ...prev, 
              selectedMemberIds: data.content.map((m: OrgMember) => m.orgMemberId) 
            }));
          }
        } catch (e) {
          toastError("회원 목록을 불러오지 못했습니다.");
        }
      };
      fetchMembers();
    }
  }, [isOpen, orgId]);

  // 날짜 포맷팅 함수 (2026년 1월 1일 (목))
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  const handleDateSelect = (type: 'start' | 'end', date: Date) => {
    const formattedDate = date.toISOString().slice(0, 10);
    setFormData(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: formattedDate
    }));
    setOpenDropdown(null);
  };

  const isFormValid = formData.title.trim().length > 0 && formData.amount.length > 0;

  const handleRegister = async () => {
    const isAllSelected = formData.selectedMemberIds.length === members.length;
    
    const payload = {
      orgId: orgId,
      title: formData.title,
      amountPerMember: parseInt(formData.amount.replace(/,/g, '')),
      startDate: formData.startDate,
      endDate: formData.endDate,
      dueScope: isAllSelected ? "ALL" : "PARTIAL", // 인원 수에 따른 자동 판별
      targets: formData.selectedMemberIds, // 대상자 리스트
    };

    try {
      const response = await fetch('/api/executive/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        toastSuccess("회비 내역이 생성되었습니다.");
        onSuccess(); // 목록 갱신
        onClose();
      } else {
        toastError(result.status.message || "등록에 실패했습니다.");
      }
    } catch (e) {
      toastError("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <RegisterModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-8 px-6">
        <div className="flex flex-col gap-6">
          
          {/* 회비 제목 입력 */}
          <input
            className="text-title-2b outline-none placeholder:text-label-disabled border-b pb-2 border-line-normal"
            placeholder="어떤 회비인가요?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          {/* 기간 선택 */}
          <div className="flex flex-col gap-3">
            {[formData.startDate, formData.endDate].map((dateVal, idx) => (
              <div key={idx} className="flex items-center gap-4 relative">
                <img src="/icons/Calendar.svg" alt="calendar" className={`w-6 h-6 ${idx === 1 ? 'opacity-0' : ''}`} />
                <button
                  className="flex bg-white border border-line-normal rounded-xl px-4 py-3 w-full text-body-1 text-label-normal cursor-pointer"
                  onClick={() => setOpenDropdown(openDropdown === (idx === 0 ? 'startDate' : 'endDate') ? null : (idx === 0 ? 'startDate' : 'endDate'))}
                >
                  {formatDateWithDay(dateVal)}
                </button>
                {openDropdown === (idx === 0 ? 'startDate' : 'endDate') && (
                  <div className="absolute top-full left-10 mt-2 z-50">
                    <MiniCalendar
                      currentDate={dateVal}
                      onSelect={(date) => handleDateSelect(idx === 0 ? 'start' : 'end', date)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 금액 입력 */}
          <div className="flex items-center gap-4">
            <img src="/icons/inventory-gray.svg" alt="amount" className="w-6 h-6" />
            <div className="relative flex-1">
              <input
                className="w-full bg-white border border-line-normal outline-none rounded-xl px-4 py-3 text-body-1"
                placeholder="1인당 회비 금액을 입력해 주세요."
                value={formData.amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, amount: val ? Number(val).toLocaleString() : '' });
                }}
              />
            </div>
          </div>

          {/* 납부 인원 선택 */}
          <div className="flex items-center gap-4">
            <img src="/icons/Person.svg" alt="members" className="w-6 h-6" />
            <button 
              className="flex items-center gap-1 text-body-1 text-label-normal"
              onClick={() => setOpenDropdown(openDropdown === 'member' ? null : 'member')}
            >
              납부 인원 <span className="text-body-1sb ml-1">{formData.selectedMemberIds.length}명</span>
              <img src="/icons/trailingIcon.svg" alt="arrow" className={`w-4 h-4 transition-transform ${openDropdown === 'member' ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {/* 인원 선택 리스트 (isMemberOpen 상태 시 노출) */}
          {openDropdown === 'member' && (
            <div className="ml-10 max-h-[200px] overflow-y-auto border border-line-normal rounded-xl p-4 grid grid-cols-2 gap-2">
              {members.map(member => (
                <div 
                  key={member.orgMemberId}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    const ids = formData.selectedMemberIds;
                    setFormData({
                      ...formData,
                      selectedMemberIds: ids.includes(member.orgMemberId)
                        ? ids.filter(id => id !== member.orgMemberId)
                        : [...ids, member.orgMemberId]
                    });
                  }}
                >
                  <img 
                    src={formData.selectedMemberIds.includes(member.orgMemberId) ? "/icons/blue-check.svg" : "/icons/white-check.svg"} 
                    alt="check"
                    className="w-5 h-5" 
                  />
                  <span className="text-body-2">{member.nickname}</span>
                </div>
              ))}
            </div>
          )}

          {/* 하단 요약 문구 (금액 입력 시 노출) */}
          {formData.amount && (
            <div className="text-center text-body-2 text-label-normal mt-2">
              1인당 <span className="font-bold">{formData.amount}원</span>씩, 
              <span className="text-primary-500 font-bold ml-1">총 {(Number(formData.amount.replace(/,/g, '')) * formData.selectedMemberIds.length).toLocaleString()}원</span>을 걷어요.
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="m"
          className={`w-full ${!isFormValid ? 'bg-gray-100 text-label-disabled cursor-not-allowed' : ''}`}
          disabled={!isFormValid}
          onClick={handleRegister}
        >
          등록
        </Button>
      </div>
    </RegisterModal>
  );
};