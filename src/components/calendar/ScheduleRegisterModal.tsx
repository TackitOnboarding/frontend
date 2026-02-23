import { useState, useEffect } from 'react';
import { CalendarModal } from "../modals/CalendarModal";
import { CalendarColorType } from '@/types/calendar';
import { Button } from '../ui/Button';
import { ColorPicker } from './ColorPicker';
import { MiniCalendar } from './MiniCalendar';
import { TimePicker } from './TimePicker';

interface OrgMember {
  orgMemberId: number;
  profileImage: string;
  nickname: string;
}

interface ScheduleRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // 수정 시 전달받을 데이터
  inEdit?: boolean; // 수정 모드인지 여부
  orgId?: number;
}

export const ScheduleRegisterModal = ({ isOpen, onClose, initialData, inEdit = false, orgId = 10 }: ScheduleRegisterModalProps) => {
  const [members, setMembers] = useState<OrgMember[]>([])
  const [isMemberOpen, setIsMemberOpen] = useState(false)
  const [isAllDay, setIsAllDay] = useState(false); // "하루종일" 상태
  const [openDropdown, setOpenDropdown] = useState<'startDay' | 'startAMPM' |'startHour' | 'endDay' | 'endAMPM' |'endHour' | null>(null);

  // 한국 기준 시간 변환 함수
  const formatKSTISO = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const kstDate = new Date(date.getTime() - offset);
    return kstDate.toISOString().slice(0, 16);
  };

  // 초기 시간 설정
  const getInitialTime = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0); // 정시로 맞춤
    const formatted = formatKSTISO(now);
    return { startsAt: formatted, endsAt: formatted };
  };

  const [formData, setFormData] = useState({
    title: "",
    startsAt: getInitialTime().startsAt, // 초기 시간으로 설정
    endsAt: getInitialTime().endsAt, // 초기 시간으로 설정
    description: "",
    participants: [] as number[],
    colorChip: "blue" as CalendarColorType,
    scope: "PARTIAL" as "PARTIAL" | "ALL" | "SELECT"
  });

  // 수정 모드일 경우 데이터 채워넣기
  useEffect(() => {
    if (isOpen && inEdit && initialData) {
      setFormData({
        title: initialData.title || "",
        startsAt: initialData.startsAt ? initialData.startsAt.slice(0, 16) : getInitialTime().startsAt,
        endsAt: initialData.endsAt ? initialData.endsAt.slice(0, 16) : getInitialTime().endsAt,
        description: initialData.description || "",
        colorChip: (initialData.colorChip as CalendarColorType) || "blue",
        participants: initialData.participants?.map((p: any) => p.orgMemberId) || [],
        scope: initialData.targetType === "SELECT" ? "PARTIAL" : (initialData.targetType || "PARTIAL")
      });
    } else if (!isOpen) {
      // 닫힐 때 초기화
      const reset = getInitialTime();
      setFormData({
        title: "",
        startsAt: reset.startsAt,
        endsAt: reset.endsAt,
        description: "",
        participants: [],
        colorChip: "blue",
        scope: "PARTIAL"
      });
      setIsMemberOpen(false);
      setIsAllDay(false);
    }
  }, [isOpen, inEdit, initialData]);

  const handleDateSelect = (type: 'start' | 'end', selectedDate: Date) => {
    setFormData(prev => {
      const field = type === 'start' ? 'startsAt' : 'endsAt';
      // 기존 저장된 시간(HH:mm)을 유지하기 위해 Date 객체 생성
      const currentFullDate = new Date(prev[field]);
      currentFullDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      return { ...prev, [field]: formatKSTISO(currentFullDate)};
    });
    setOpenDropdown(null); // 드롭다운 닫기
  };

  const handleTimeSelect = (type: 'start' | 'end', timeValue: string) => {
    setFormData(prev => {
      const field = type === 'start' ? 'startsAt' : 'endsAt';
      const currentDate = new Date(prev[field]);
      let hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();

      if (timeValue === '오전' || timeValue === '오후') {
        // 오전/오후 변경 로직
        if (timeValue === '오후' && hours < 12) hours += 12;
        if (timeValue === '오전' && hours >= 12) hours -= 12;
      } else {
        // 시간(01:00~12:00) 변경 로직
        const [newHour] = timeValue.split(':').map(Number);
        const isPM = hours >= 12;
        hours = isPM ? (newHour === 12 ? 12 : newHour + 12) : (newHour === 12 ? 0 : newHour);
      }

      currentDate.setHours(hours, minutes);
      return { ...prev, [field]: formatKSTISO(currentDate) };
    });
  };

  // 전송 핸들러 (POST / PATCH 분기)
  const handleAction = async () => {
    if (formData.title.trim().length === 0) return;

    // 초 단위(:00)를 포함한 최종 데이터 가공
    const basePayload = {
      title: formData.title,
      startsAt: formData.startsAt + ":00",
      endsAt: formData.endsAt + ":00",
      description: formData.description,
      participants: formData.participants,
      colorChip: formData.colorChip,
    };

    if (inEdit) {
      // 수정(PUT) Request Body
      const updateReq = {
        ...basePayload,
        targetType: formData.scope === "PARTIAL" ? "SELECT" : "ALL"
      };
      console.log("수정 API 호출 [PUT]:", updateReq);
    } else {
      // 생성(POST) Request Body
      const createReq = {
        ...basePayload,
        orgId: orgId,
        eventScope: formData.scope === "SELECT" ? "PARTIAL" : formData.scope
      };
      console.log("생성 API 호출 [POST]:", createReq);
    }
    onClose();
  };

  const toggleParticipant = (id: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter(pId => pId !== id)
        : [...prev.participants, id]
    }));
  };

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
    hours = hours % 12;
    hours = hours ? hours : 12; // 0시는 12시로 표시
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${ampm} ${hours}:${minutesStr}`;
  };

  // 등록 버튼 활성화 조건 (제목이 공백이 아닐 때)
  const isFormValid = formData.title.trim().length > 0

  // 멤버 데이터 로드 (API 연결 시점)
  // useEffect(() => {
  //   if (isOpen) {
  //     // 실제 API: /api/orgs/{orgId}/members 호출
  //     setMembers(Array.from({ length: 11 }, (_, i) => ({
  //       orgMemberId: i + 1,
  //       profileImageUrl: "",
  //       nickname: `닉네임${i + 1}`
  //     })));
  //   }
  // }, [isOpen]);

  return (
    <CalendarModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-8 px-6">
        <div className="flex flex-col gap-6">
          
          {/* 제목 & 색상 피커 */}
          <div className="flex gap-3 items-center justify-start">
            <ColorPicker
              selectedColor={formData.colorChip}
              onSelect={(color) => setFormData({ ...formData, colorChip: color})}
            />
            <input
              className="flex-1 text-title-2b outline-none placeholder:text-label-disabled border-b pb-2 border-line-normal"
              placeholder="일정 제목"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* 날짜 시간 선택 */}
          <div className="flex flex-col gap-3">
            {[formData.startsAt, formData.endsAt].map((dateVal, idx) => (
              <div key={idx} className="flex items-center gap-4">
                {idx === 0 ? <img src="/icons/Clock.svg" alt="startsAt" className="w-6 h-6"/> : <div className="w-6" />}
                <div className=" relative flex items-center gap-3">
                  <button
                    className="flex bg-white border border-line-normal rounded-xl px-4 py-3 w-[195px] cursor-pointer"
                    onClick={() => setOpenDropdown(openDropdown === (idx === 0 ? 'startDay' : 'endDay') ? null : (idx === 0 ? 'startDay' : 'endDay'))}
                  >
                    {formatDate(dateVal)}
                  </button>
                  {openDropdown === (idx === 0 ? 'startDay' : 'endDay') && (
                    <div className="absolute top-full mt-2 z-10">
                      <MiniCalendar
                        currentDate={dateVal}
                        onSelect={(date) => handleDateSelect(idx === 0 ? 'start' : 'end', date)}
                      />
                    </div>
                  )}
                  {!isAllDay && (
                    <div className="flex items-center">
                      <div className="relative">
                        <button
                        className="flex bg-white border border-line-normal border-r-0 rounded-l-xl pl-4 py-3 w-[50px] cursor-pointer justify-center"
                        onClick={() => setOpenDropdown(openDropdown === (idx === 0 ? 'startAMPM' : 'endAMPM') ? null : (idx === 0 ? 'startAMPM' : 'endAMPM'))}
                        >
                          {formatTime(dateVal).split(' ')[0]}
                        </button>
                        {openDropdown === (idx === 0 ? 'startAMPM' : 'endAMPM') && (
                          <div className="flex gap-1 absolute top-full left-0 z-[130]">
                            <TimePicker 
                              type="ampm" 
                            onSelect={(val) => handleTimeSelect(idx === 0 ? 'start' : 'end', val)} 
                            onClose={() => setOpenDropdown(null)}
                            />
                          </div>
                        )}
                      </div>

                      {/* 2. 시:분 버튼 (오른쪽) */}
                      <div className="relative">
                        <button
                          type="button"
                          className="flex bg-white border border-line-normal border-l-0 rounded-r-xl pl-1 py-3 w-[95px] cursor-pointer"
                          onClick={() => setOpenDropdown(openDropdown === (idx === 0 ? 'startHour' : 'endHour') ? null : (idx === 0 ? 'startHour' : 'endHour'))}
                        >
                          {formatTime(dateVal).split(' ')[1]}
                        </button>

                        {openDropdown === (idx === 0 ? 'startHour' : 'endHour') && (
                          <TimePicker 
                            type="hour" 
                            onSelect={(val) => handleTimeSelect(idx === 0 ? 'start' : 'end', val)} 
                            onClose={() => setOpenDropdown(null)} 
                          />
                        )}
                      </div>
                    </div>
                  )}


                </div>
              </div>
            ))}

            {/* 하루종일 토글 */}
            <div className="flex items-center gap-2 cursor-pointer w-fit">
              <div className="w-8"/>
              <button
                type="button"
                onClick={() => setIsAllDay(!isAllDay)}
                className="focus:outline-none cursor-pointer"
              >
                {isAllDay ? (
                  /* 체크된 상태: 파란색 원 안에 체크 아이콘 */
                  <img src="/icons/check-circle.svg" alt="checked" className="w-6 h-6" />
                ) : (
                  /* 체크 안 된 상태: 회색 테두리 원 */
                  <div className="w-6 h-6 rounded-full border-2 border-line-normal bg-white transition-colors group-hover:border-interaction-normal" />
                )}
              </button>
              <span className="text-label-normal text-body-1">하루종일</span>
            </div>
          </div>

          {/* 설명 */}
          <div className="flex items-center gap-4">
            <img src="/icons/List.svg" alt="description" className="w-6 h-6"/>
            <input
              className="flex bg-white border border-line-normal outline-none rounded-xl px-4 py-3 w-[352px]"
              placeholder="설명 입력"
              value={formData.description}
              onChange={(e) => setFormData({ ... formData, description: e.target.value })}
            />
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
        </div>

        <Button
          variant="primary"
          size="m"
          className="w-full mt-4"
          disabled={!isFormValid}
          onClick={handleAction}
        >{inEdit ? "수정 완료" : "등록"}</Button>
      </div>
    </CalendarModal>
  )
}