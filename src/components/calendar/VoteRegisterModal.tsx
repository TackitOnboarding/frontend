import { useState, useEffect } from 'react';
import { CalendarColorType, Participant } from '../../types/calendar';
import { calendarApi } from '../../api/calendar';
import { RegisterModal } from "../modals/RegisterModal";
import { Button } from '../ui/Button';
import { MiniCalendar } from './MiniCalendar';
import { TimePicker } from './TimePicker';

type VoteType = 'TEXT' | 'DATE';

interface VoteRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  inEdit?: boolean;
  initialData?: any;
  onSuccess?: () => void;   // 수정 시 전달받을 데이터
}

export const VoteRegisterModal = ({ isOpen, onClose, inEdit, initialData, onSuccess }: VoteRegisterModalProps) => {
  const [members, setMembers] = useState<Participant[]>([]);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);

  const activeProfileId = localStorage.getItem('activeProfileId');

  // 드롭다운 상태
  const [openDropdown, setOpenDropdown] = useState<'deadlineDay' | 'deadlineAMPM' | 'deadlineHour' | 'itemDate' | null>(null);
  const [activeItemIdx, setActiveItemIdx] = useState<number | null>(null);

  // 날짜/시간 포맷팅 유틸 (기존 로직 활용)
  const formatKSTISO = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };
  
  // 초기 시간 설정
  const getInitialTime = () => {
    const now = new Date();
    now.setHours(23, 59, 0, 0);
    return formatKSTISO(now);
  };

  const [formData, setFormData] = useState({
    title: "",
    endsAt: getInitialTime(),
    optionType: "TEXT" as VoteType,
    options: ["", "", ""],
    isMulti: false,
    isAnonymous: false,
    colorChip: "gray" as CalendarColorType,
    participants: [] as number[],
  });

  // 모임 회원 조회
  useEffect(() => {
    if (isOpen && activeProfileId) {
      const fetchMembers = async () => {
        try {
          const data = await calendarApi.getOrgMembers(Number(activeProfileId));
          setMembers(data);
        } catch (error) {
          console.error("멤버 로드 실패:", error);
        }
      };
      fetchMembers();
    }
  }, [isOpen, activeProfileId]);

  // 수정
  useEffect(() => {
    if (isOpen && inEdit && initialData) {
      setFormData({
        title: initialData.title || "",
        endsAt: initialData.endsAt?.slice(0, 16) || getInitialTime(),
        optionType: initialData.optionType || "TEXT",
        options: initialData.options?.map((opt: any) => opt.content) || ["", "", ""],
        isMulti: initialData.isMulti || false,
        isAnonymous: initialData.isAnonymous || false,
        colorChip: initialData.colorChip || "gray",
        participants: initialData.participants?.map((p: any) => p.orgMemberId) || [],
      });
      setHasDeadline(!!initialData.endsAt);
    } else if (!isOpen) {
      setFormData({
        title: "",
        endsAt: getInitialTime(),
        optionType: "TEXT",
        options: ["", "", ""],
        isMulti: false,
        isAnonymous: false,
        colorChip: "gray",
        participants: [],
      });
      setIsMemberOpen(false);
    }
  }, [isOpen, inEdit, initialData]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12 || 12;
    return `${ampm} ${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const handleDeadlineDate = (date: Date) => {
    const current = new Date(formData.endsAt);
    current.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setFormData({ ...formData, endsAt: formatKSTISO(current) });
    setOpenDropdown(null);
  };

  const handleDeadlineTime = (val: string) => {
    const current = new Date(formData.endsAt);
    let hours = current.getHours();
    if (val === '오전' || val === '오후') {
      if (val === '오후' && hours < 12) hours += 12;
      if (val === '오전' && hours >= 12) hours -= 12;
    } else {
      const [h] = val.split(':').map(Number);
      hours = current.getHours() >= 12 ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    }
    current.setHours(hours);
    setFormData({ ...formData, endsAt: formatKSTISO(current) });
  };

  const handleRegister = async () => {
    if (formData.title.trim().length === 0) return;

    const validOptions = formData.options.filter(opt => opt.trim() !== "");

    try {
      if (inEdit && initialData) {
        // 1. 투표 수정 (PATCH)
        await calendarApi.updatePoll(initialData.pollId, {
          title: formData.title,
          endsAt: hasDeadline ? `${formData.endsAt}:00` : null,
          isMulti: formData.isMulti,
          // 💡 수정 시 항목 변경 로직이 필요하다면 여기에 추가
        });
      } else {
        // 2. 투표 생성 (POST) 💡 에러 해결을 위해 명세서 필드명으로 직접 매핑
        await calendarApi.createPoll({
          orgId: Number(activeProfileId),
          title: formData.title,
          endsAt: hasDeadline ? `${formData.endsAt}:00` : "2099-12-31T23:59:59", // 💡 string 필수일 경우 먼 미래값 혹은 null 처리(API 타입 확인)
          optionType: formData.optionType,
          pollOptions: validOptions, // 💡 options -> pollOptions로 변경
          isMulti: formData.isMulti,
          isAnonymous: formData.isAnonymous,
          colorChip: "gray", // 💡 고정값이라도 명세에 있으면 포함
          pollScope: formData.participants.length === 0 ? "ALL" : "PARTIAL", // 💡 voteScope -> pollScope로 변경
          participants: formData.participants,
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("투표 저장 실패:", error);
    }
  };

  const toggleParticipant = (id: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter(pId => pId !== id)
        : [...prev.participants, id]
    }));
  };

  const isFormValid = formData.title.trim() !== '' && formData.options.filter(i => i !== '').length >= 2;

  return (
    <RegisterModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-6 px-6">
        {/* 투표 제목 */}
        <input
          className="text-title-2b outline-none placeholder:text-label-disabled border-b pb-2 border-line-normal"
          placeholder="투표 제목"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        {/* 투표 항목 리스트 */}
        <div className="flex flex-col gap-4">
          {/* 투표 타입 스위치 */}
          <div className="flex gap-2 w-[150px]">
            {['TEXT', 'DATE'].map((type) => (
              <button
                key={type}
                onClick={() => setFormData({ ...formData, optionType: type as VoteType, options: ["", "", ""] })}
                className={`px-3 py-2 rounded-lg border text-body-2sb transition-colors ${
                  formData.optionType === type
                    ? 'border-interaction-normal text-interaction-normal' 
                    : 'border-line-normal text-label-neutral bg-white'
                }`}
              >
                {type === 'TEXT' ? '텍스트' : '날짜'}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">       
            {formData.options.map((item, idx) => (
              <div key={idx} className="relative">
                <input
                  readOnly={formData.optionType === 'DATE'}
                  onClick={() => {
                    if (formData.optionType === 'DATE') {
                      setOpenDropdown('itemDate');
                      setActiveItemIdx(idx);
                    }
                  }}
                  className="w-full bg-white border border-line-normal rounded-xl px-4 py-3 cursor-pointer outline-none"
                  placeholder={formData.optionType === 'TEXT' ? "항목 입력" : "날짜 선택"}
                  value={formData.optionType === 'DATE' && item ? formatDate(item) : item}
                  onChange={(e) => {
                    if (formData.optionType === 'TEXT') {
                    const newOptions = [...formData.options];
                    newOptions[idx] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }
                  }}
                />
                {/* 날짜 투표 시 달력 드롭다운 */}
                {formData.optionType === 'DATE' && openDropdown === 'itemDate' && activeItemIdx === idx && (
                  <div className="absolute top-full left-0 z-[140] mt-2">
                    <MiniCalendar
                      currentDate={item || formData.endsAt}
                      onSelect={(date) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = formatKSTISO(date);
                        setFormData({ ...formData, options: newOptions });
                        setOpenDropdown(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            <Button
              variant="outlined"
              size="m" 
              onClick={() => setFormData({ ...formData, options: [...formData.options, ""] })}
              className="w-full flex justify-center items-center py-3 border border-line-normal rounded-xl hover:bg-background-secondary transition-colors"
            >
              <img src="/icons/add-black.svg" alt="add" className="w-5 h-5 opacity-40" />
            </Button>
          </div>
          
        </div>

        {/* 옵션 섹션 */}
        <div className="flex flex-col gap-3">
          {[
            { key: 'isMulti', label: '복수 선택', state: formData.isMulti },
            { key: 'isAnonymous', label: '익명 투표', state: formData.isAnonymous },
            { key: 'hasDeadline', label: '종료 시간', state: hasDeadline },
          ].map((opt) => (
            <div key={opt.key} className="flex flex-col gap-3">
              <div 
                className="flex items-center gap-3 cursor-pointer group w-fit" 
                onClick={() => {
                  if (opt.key === 'hasDeadline') setHasDeadline(!hasDeadline);
                  else setFormData({ ...formData, [opt.key]: !opt.state });
                }}
              >
                {opt.state ? (
                  <img src="/icons/check-circle.svg" alt="checked" className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-line-normal bg-white transition-colors group-hover:border-interaction-normal" />
                )}
                <span className="text-body-1 text-label-normal select-none">{opt.label}</span>
              </div>

              {/* 종료 시간 활성화 시 나타나는 날짜/시간 선택기 */}
              {opt.label === '종료 시간' && hasDeadline && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      className="flex bg-white border border-line-normal rounded-xl px-4 py-3 w-[195px] cursor-pointer"
                      onClick={() => setOpenDropdown(openDropdown === 'deadlineDay' ? null : 'deadlineDay')}
                    >
                      {formatDate(formData.endsAt)}
                    </button>
                    {openDropdown === 'deadlineDay' && (
                      <div className="absolute top-full mt-2 z-10">
                        <MiniCalendar currentDate={formData.endsAt} onSelect={handleDeadlineDate} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative">
                      <button
                        className="flex bg-white border border-line-normal border-r-0 rounded-l-xl pl-4 py-3 w-[50px] cursor-pointer justify-center"
                        onClick={() => setOpenDropdown(openDropdown === 'deadlineAMPM' ? null : 'deadlineAMPM')}
                      >
                        {formatTime(formData.endsAt).split(' ')[0]}
                      </button>
                      {openDropdown === 'deadlineAMPM' && (
                        <TimePicker type="ampm" onSelect={handleDeadlineTime} onClose={() => setOpenDropdown(null)} />
                      )}
                    </div>
                    <div className="relative">
                      <button
                        className="flex bg-white border border-line-normal border-l-0 rounded-r-xl pl-1 py-3 w-[95px] cursor-pointer"
                        onClick={() => setOpenDropdown(openDropdown === 'deadlineHour' ? null : 'deadlineHour')}
                      >
                        {formatTime(formData.endsAt).split(' ')[1]}
                      </button>
                      {openDropdown === 'deadlineHour' && (
                        <TimePicker type="hour" onSelect={handleDeadlineTime} onClose={() => setOpenDropdown(null)} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 참석 인원 선택 */}
        <div className="flex items-center gap-4">
          <img src="/icons/Person.svg" alt="participants" className="w-6 h-6" />
          <button
            onClick={() => setIsMemberOpen(!isMemberOpen)}
            className="flex items-center gap-2 text-body-1 text-label-neutral cursor-pointer"
          >
            참석 인원 <span className="text-label-normal text-body-1sb">{formData.participants.length}명</span>
            <img src="/icons/trailingIcon.svg" alt="dropdown" className={`w-4 h-4 transition-transform ${isMemberOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {isMemberOpen && (
          <div className="ml-10 mt-4 max-h-[240px] overflow-y-auto custom-sidebar-scroll pr-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {members.map((member) => {
                const isSelected = formData.participants.includes(member.orgMemberId);
                return (
                  <div 
                  key={member.orgMemberId}
                  className="flex items-center justify-between group gap-3"
                  onClick={() => toggleParticipant(member.orgMemberId)}
                  >
                    {/* 프포필 + 닉네임 + 뱃지 */}
                  <div className="flex items-center gap-2">
                    <img src="/icons/profile-gray.svg" alt="profile" className="w-8 h-8"/>
                    <span className="text-body-1sb text-label-normal">{member.nickname}</span>
                    <img src="icons/.svg" alt="type" className="w-5 h-5" />
                  </div>
                  
                  {/* 체크 표시 */}
                  <img 
                    src={isSelected ?"/icons/blue-check.svg" : "/icons/white-check.svg"}
                    alt="select" 
                    className="w-6 h-6"
                  />
                </div>
                )                  
              })}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="m"
          className="w-full mt-2"
          disabled={!isFormValid}
          onClick={handleRegister}
        >{inEdit ? "수정 완료" : "등록"}</Button>
      </div>
    </RegisterModal>
  );
};