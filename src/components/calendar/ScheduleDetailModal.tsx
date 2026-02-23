import { CalendarModal } from "../modals/CalendarModal";
import { Button } from "../ui/Button";
import { CALENDAR_COLORS } from "../../types/calendar"

// 백엔드 API 응답 구조에 맞춘 인터페이스
interface Participant {
  orgMemberId: number;
  profileImageUrl: string;
  nickname: string;
}

interface ScheduleDetailData {
  eventId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  description: string;
  colorChip: string;
  participants: Participant[];
}

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ScheduleDetailData | null;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export const ScheduleDetailModal = ({ 
  isOpen, 
  onClose, 
  data, 
  onDelete, 
  onEdit 
}: ScheduleDetailModalProps) => {
  if (!data) return null;

  const activeColor = CALENDAR_COLORS.find(c => c.id === data.colorChip) || CALENDAR_COLORS[0];

  // 날짜 및 시간 포맷팅 (예: 1월 10일 (토) 11:00 ~ 11:30)
  const formatDateTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      weekday: 'short' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    };

    const dateStr = startDate.toLocaleDateString('ko-KR', dateOptions);
    const startTimeStr = startDate.toLocaleTimeString('ko-KR', timeOptions);
    const endTimeStr = endDate.toLocaleTimeString('ko-KR', timeOptions);

    return `${dateStr} ${startTimeStr} ~ ${endTimeStr}`;
  };

  return (
    <CalendarModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col px-6 gap-8">
        {/* 상단: 제목 및 컬러 칩 */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-5 justify-start">
            <div 
              className={`w-5 h-5 rounded-full ${activeColor.class}`} 
            />
            <h2 className="text-title-2b text-label-normal">{data.title}</h2>
          </div>

          {/* 정보 리스트 */}
          <div className="flex flex-col gap-3">
            {/* 시간 정보 */}
            <div className="flex items-start gap-4">
              <img src="/icons/Clock.svg" className="w-6 h-6" alt="시간" />
              <span className="text-body-1 text-label-normal">
                {formatDateTime(data.startsAt, data.endsAt)}
              </span>
            </div>

            {/* 일정 설명 */}
            <div className="flex items-start gap-4">
              <img src="/icons/List.svg" className="w-6 h-6" alt="설명" />
              <span className="text-body-1 text-label-normal whitespace-pre-wrap">
                {data.description || "설명이 없습니다."}
              </span>
            </div>

            {/* 참여자 정보 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                <img src="/icons/Person.svg" className="w-6 h-6" alt="참여자" />
                <div className="flex items-center gap-2 text-body-1 text-label-normal">
                  <span>참석 인원</span>
                  <span className="text-body-1sb">{data.participants.length}명</span>
                </div>
              </div>
              
              <div className="flex gap-2">      
                {/* 참여자 프로필 스택 */}
                <div className="flex -space-x-2">
                  {data.participants.map((person) => (
                    <div 
                      key={person.orgMemberId} 
                      className="w-8 h-8 rounded-full border-2 border-white bg-background-tertiary overflow-hidden"
                    >
                      <img 
                        src={person.profileImageUrl || "/icons/profile-gray.svg"} 
                        alt={person.nickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 (삭제/수정) */}
        <div className="flex gap-2">
          <Button 
            variant="outlined"
            size="outlinedM"
            className="w-full mt-4"
            onClick={() => onDelete?.(data.eventId)}
          >
            삭제
          </Button>
          <Button 
            variant="outlined" 
            size="outlinedM"
            className="w-full mt-4"
            onClick={() => onEdit?.(data.eventId)}
          >
            수정
          </Button>
        </div>
      </div>
    </CalendarModal>
  );
};