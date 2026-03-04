import { useState, useEffect } from 'react';
import { RegisterModal } from "../modals/RegisterModal";
import { Button } from '../ui/Button';
import { MiniCalendar } from './MiniCalendar';
import { TimePicker } from './TimePicker';

type VoteType = 'TEXT' | 'DATE';

interface OrgMember {
  orgMemberId: number;
  profileImage: string;
  nickname: string;
}

interface VoteRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  inEdit?: boolean;      // 수정 모드 여부
  initialData?: any;     // 수정 시 전달받을 데이터
}

export const VoteRegisterModal = ({ isOpen, onClose, inEdit, initialData }: VoteRegisterModalProps) => {
  const [members] = useState<OrgMember[]>([]);
  const [isMemberOpen, setIsMemberOpen] = useState(false);

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
    now.setMinutes(0, 0, 0); // 정시로 맞춤
    const formatted = formatKSTISO(now);
    return { startsAt: formatted, endsAt: formatted };
  };

  const [formData, setFormData] = useState({
    orgId: 10, // 예시값, 실제론 props 등으로 받아와야 함
    title: "",
    endsAt: getInitialTime().endsAt,
    optionType: "TEXT" as VoteType,
    options: ["", "", ""],
    isMulti: false,
    isAnonymous: false,
    voteScope: "PARTIAL" as "ALL" | "PARTIAL",
    participants: [] as number[],
  });

  const [hasDeadline, setHasDeadline] = useState(false);

  useEffect(() => {
    if (isOpen && inEdit && initialData) {
      setFormData({
        orgId: initialData.orgId || 10,
        title: initialData.title || "",
        endsAt: initialData.endsAt ? initialData.endsAt.slice(0, 16) : getInitialTime().endsAt,
        optionType: initialData.optionType || "TEXT",
        options: initialData.options?.map((opt: any) => opt.content) || ["", "", ""],
        isMulti: initialData.isMulti || false,
        isAnonymous: initialData.isAnonymous || false,
        voteScope: initialData.voteScope || "PARTIAL",
        participants: initialData.participants || [],
      });
      setHasDeadline(!!initialData.endsAt);
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

    // 1. 공통 데이터 가공 (KST 기준 ISO 형식)
    const commonData = {
      title: formData.title,
      endsAt: formData.endsAt + ":00", // 초 단위 포함
      isMulti: formData.isMulti,
    };

    try {
      if (inEdit && initialData) {
        // 2. 투표 수정 (PUT) - 명세서에 따라 NULL 허용되는 필드들 위주로 구성
        const updatePayload = {
          ...commonData,
          isAnonymous: formData.isAnonymous,
          // 논의가 필요한 필드들은 필요 시 포함 (options, voteScope 등)
        };

        console.log(`투표 수정 요청 [PUT] /api/polls/${initialData.pollId}`, updatePayload);
        // await axios.put(`/api/polls/${initialData.pollId}`, updatePayload);
        
      } else {
        // 3. 투표 생성 (POST)
        const createPayload = {
          ...commonData,
          orgId: 10, // 현재 조직 ID
          optionType: formData.optionType,
          options: formData.options, //
          isAnonymous: formData.isAnonymous,
          voteScope: formData.voteScope,
          participants: formData.participants,
        };

        console.log("투표 생성 요청 [POST]:", createPayload);
        // await axios.post(`/api/polls`, createPayload);
      }
      
      onClose();
    } catch (error: any) {
      // 4. 에러 처리 (운영자 권한 403 등)
      if (error.response?.status === 403) {
        alert(error.response.data.status.message); // "해당 조직의 운영자가 아닙니다."
      } else if (error.response?.status === 404) {
        alert("존재하지 않는 투표입니다.");
      }
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