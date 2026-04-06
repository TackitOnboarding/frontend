import { useState, useEffect } from "react"
import { CalendarUtils, type Schedule, type Vote } from "../../types/calendar";
import { calendarApi } from "../../api/calendar";
import { CalendarChip } from "../../components/calendar/CalendarChip";
import { ScheduleRegisterModal } from "../../components/calendar/ScheduleRegisterModal";
import { VoteRegisterModal } from "../../components/calendar/VoteRegisterModal";
import { ScheduleDetailModal } from "../../components/calendar/ScheduleDetailModal";
import { VoteParticipationModal } from "../../components/calendar/VoteParticipationModal";
import Modal from "../../components/modals/Modal";

export default function MonthlyCalendar() {
  // 화면에 보여줄 기준 날짜 상태(기본값: 오늘
  const [viewDate, setViewDate] = useState(new Date());

  // 서버에서 받아올 데이터 상태
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  // 모달 상태 관리 State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isVoteDetailOpen, setIsVoteDetailOpen] = useState(false);
  const [isVoteDeleteModalOpen, setIsVoteDeleteModalOpen] = useState(false);

  // 데이터 및 모드 관리
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVote, setSelectedVote] = useState<any>(null);
  const [isVoteEditMode, setIsVoteEditMode] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // 월간 데이터 로드
  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const [scheduleRes, voteRes]: [any, any] = await Promise.all([
        calendarApi.getMonthlyEvents(year, month + 1),
        calendarApi.getMonthlyPolls(year, month + 1)
      ]);
      const scheduleData = scheduleRes.content || [];
      setSchedules(scheduleData);

      const voteData = (voteRes.content || []).map((v: any) => ({
        ...v,
        pollId: v.id, // 서버 id -> 프론트 pollId 매핑
        colorChip: v.colorChip || "gray" 
      }));
      setVotes(voteData);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMonthlyData();
  }, [year, month]);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const calendarDays = CalendarUtils.getCalendarDays(year, month);

  // Schedule POST
  const handleNewScheduleClick = () => {
    setIsEditMode(false);
    setSelectedSchedule(null);
    setIsScheduleModalOpen(true);
  };

  // Schedule PATCH
  const handleEditClick = (id: number) => {
    setIsDetailModalOpen(false); 
    setIsEditMode(true);         
    setIsScheduleModalOpen(true); 
  };

  // Vote POST
  const handleNewVoteClick = () => {
    setIsVoteEditMode(false); 
    setSelectedVote(null); 
    setIsVoteModalOpen(true);  
  };

  // Vote PATCH
  const handleVoteEdit = () => {
    setIsVoteDetailOpen(false);
    setIsVoteEditMode(true);
    setIsVoteModalOpen(true); 
  };

  // 칩 클릭 핸들러
  const handleChipClick = async (item: any) => {
    try {
      if ('eventId' in item) {
        const detail = await calendarApi.getEventDetail(item.eventId);
        setSelectedSchedule(detail);
        setIsDetailModalOpen(true);
      } else if ('pollId' in item) {
        const detail = await calendarApi.getPollDetail(item.pollId);
        setSelectedVote(detail);
        setIsVoteDetailOpen(true);
      }
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
    }
  };

  // 삭제 확인 함수
  const handleDeleteConfirm = async () => {
    if (!selectedSchedule) return;
    try {
      await calendarApi.deleteEvent(selectedSchedule.eventId);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      fetchMonthlyData(); // 데이터 새로고침
    } catch (error) {
      console.error("삭제 실패", error);
    }
  };

  const handleVoteDeleteConfirm = async () => {
    if (!selectedVote) return;
    try {
      await calendarApi.deletePoll(selectedVote.pollId);
      setIsVoteDeleteModalOpen(false);
      setIsVoteDetailOpen(false);
      fetchMonthlyData(); // 데이터 새로고침
    } catch (error) {
      console.error("투표 삭제 실패", error);
    }
};

  // 현재 날짜 칸에서 렌더링해야 할 아이템들의 순서를 계산하는 함수
  const getRenderItems = (dateStr: string, index: number) => {
    // 1. 해당 날짜에 "걸쳐 있는" 모든 데이터 (줄 번호 고정용)
    const allOngoing = [
      ...schedules.filter(s => CalendarUtils.isDateInRange(dateStr, s.startsAt, s.endsAt)),
      ...votes.filter(v => CalendarUtils.isDateInRange(dateStr, v.endsAt, v.endsAt)) // 투표는 마감일 기준
    ].sort((a, b) => {
      const startA = 'startsAt' in a ? a.startsAt : a.endsAt;
      const startB = 'startsAt' in b ? b.startsAt : b.endsAt;
      return new Date(startA).getTime() - new Date(startB).getTime();
    });

    return allOngoing.map((item) => {
      // 2. 이 아이템이 전체 목록에서 몇 번째 줄(Row)인지 확인
     const rowIdx = allOngoing.findIndex(i => 
        ('eventId' in i && 'eventId' in item && i.eventId === item.eventId) ||
        ('pollId' in i && 'pollId' in item && i.pollId === item.pollId)
      );

      // 3. 실제로 이 칸에서 "그려야 하는지" 여부 (시작일이거나 일요일인 경우)
      const isSunday = index % 7 === 0;
      const startVal = 'startsAt' in item ? item.startsAt : item.endsAt;
      const isStartDay = startVal.startsWith(dateStr);
      const shouldRender = isStartDay || (isSunday && !isStartDay);

      return { item, rowIdx, shouldRender };
    });
  };

  return (
    <div className="flex flex-col w-full h-[800px] pt-6 pb-10 px-9 gap-4">
      {/* 상단 제어바 */}
      <div className="flex w-full justify-between">
        <div className="flex gap-3 items-center">
          <button onClick={handlePrevMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/prev-btn.svg" alt="prevMonth" className="w-8 h-8"/></button>
          <h1 className="text-title1-bold text-label-normal">{year}년 {month + 1}월</h1>
          <button onClick={handleNextMonth} className="rounded-[10px] border border-line-normal"><img src="/icons/next-btn.svg" alt="nextMonth" className="w-8 h-8"/></button>
        </div>
        <div className="flex rounded-lg">
          <button className="w-[122px] h-12 rounded-l-xl rounded-r-none border border-line-normal border-r-0" onClick={handleNewScheduleClick}>+ 일정 등록</button>
          <button className="w-[122px] h-12 rounded-r-xl rounded-l-none border border-line-normal" onClick={handleNewVoteClick}>+ 투표 등록</button>
        </div>
      </div>

      {/* 달력 */}
      <div className="w-full">
        {/* 달력 요일 영역 */}
        <div className="grid grid-cols-7 h-9 items-center">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={`text-center text-body-2 ${i === 0 ? 'text-system-red' : 'text-label-normal'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* 달력 날짜 영역 */}
        <div className="grid grid-cols-7 border-t border-l border-line-normal">
          {calendarDays.map((dateObj, index) => {
            const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();
            // 현재 칸의 날짜 (YYYY-MM-DD)
            const dateStr = CalendarUtils.formatDate(new Date(dateObj.year, dateObj.month, dateObj.day));
            const renderItems = getRenderItems(dateStr, index);

            return (
              <div key={index} className="w-[140px] h-[140px] border-r border-b border-line-normal relative hover:bg-background-alternative transition-colors">
                {/* 날짜 표시 */}
                <div className="flex flex-col items-center">

                  {/* '오늘'의 파란 동그라미*/}
                  {isToday && dateObj.isCurrentMonth && (
                    <div className="absolute top-1 w-7 h-7 bg-interaction-normal rounded-full -z-0" />
                  )}

                  {/* 날짜 숫자 */}
                  <span className={`
                    text-body-2 relative p-2 z-10
                    ${isToday && dateObj.isCurrentMonth
                      ? 'text-label-inverse' // 오늘일 때: 흰색
                      : !dateObj.isCurrentMonth
                        ? 'text-label-disable' // 이번달이 아닐 때
                        : index % 7 === 0
                          ? 'text-system-red' //일요일
                          : 'text-label-normal' //평일
                      }
                  `}>
                    {dateObj.day === 1 && dateObj.isCurrentMonth ? `${month + 1}월 1일` : dateObj.day}
                  </span>
                </div>

                {/* 일정 및 투표 칩 영역 */}
                <div className="relative px-2 mt-1">
                  {renderItems.map(({ item, rowIdx, shouldRender }) => {
                    if (!shouldRender) return null;

                    const daysLeftInWeek = 7 - (index % 7);
                    const remainingDays = CalendarUtils.getRemainingDays(dateStr, item.endsAt);
                    const displayDays = Math.min(daysLeftInWeek, remainingDays);

                    return (
                      <CalendarChip
                       key={'eventId' in item ? `s-${item.eventId}` : `v-${item.pollId}`}
                        title={item.title}
                        color={item.colorChip as any}
                        type={'eventId' in item ? 'schedule' : 'vote'}
                        isStart={'startsAt' in item ? item.startsAt.startsWith(dateStr) : item.endsAt.startsWith(dateStr)}
                        isEnd={remainingDays <= daysLeftInWeek}
                        style={{
                          width: `${CalendarUtils.calculateWidth(displayDays)}px`,
                          position: 'absolute',
                          top: `${rowIdx * 32}px`,
                          zIndex: 20,
                        }}
                        onClick={() => handleChipClick(item)}
                      />
                    );
                  })}
                </div>          
              </div>
            )
          })}
        </div>
      </div>
      {/* 3. 모달 컴포넌트 배치 */}
      <ScheduleRegisterModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => {
            setIsScheduleModalOpen(false);
            setIsEditMode(false);
        }}
        inEdit={isEditMode}
        initialData={selectedSchedule}
        onSuccess={fetchMonthlyData}
      />
      <VoteRegisterModal
        isOpen={isVoteModalOpen}
        onClose={() => {
          setIsVoteModalOpen(false);
          setIsVoteEditMode(false);
        }}
        inEdit={isVoteEditMode}
        initialData={selectedVote}
        onSuccess={fetchMonthlyData}
      />
      <ScheduleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedSchedule}
        onDelete={() => setIsDeleteModalOpen(true)}
        onEdit={handleEditClick}
      />

      <VoteParticipationModal 
      isOpen={isVoteDetailOpen}
      onClose={() => setIsVoteDetailOpen(false)}
      data={selectedVote}
      onEdit={handleVoteEdit}
      onDelete={() => setIsVoteDeleteModalOpen(true)}
      />

      {/* 삭제 확인 모달 */}
      <Modal
        open={isDeleteModalOpen}
        title="일정을 삭제하시겠습니까?"
        description="일정을 삭제하면 캘린더에서 사라져요."
        cancelText="유지하기"
        confirmText="삭제하기"
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* 투표 삭제 확인 모달 (일정 삭제 모달과 동일한 로직) */}
      <Modal
        open={isVoteDeleteModalOpen}
        title="투표를 삭제하시겠습니까?"
        description="투표를 삭제하면 캘린더에서 사라져요."
        cancelText="유지하기"
        confirmText="삭제하기"
        onCancel={() => setIsVoteDeleteModalOpen(false)}
        onConfirm={handleVoteDeleteConfirm}
      />
    </div>
  )
}