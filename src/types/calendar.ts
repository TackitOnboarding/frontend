export interface Participant {
  orgMemberId: number;
  nickname: string;
  profileImageUrl: string | null;
  memberRole: 'EXECUTIVE' | 'GENERAL' | string;
  memberType: 'SENIOR' | 'NEWBIE';
  activityYear: number;
}


export interface Schedule {
  eventId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  description: string;
  colorChip: CalendarColorType | string;
  participants: Participant[]
}

export interface VoteOption {
  id: number;
  content: string;
  voteCount: number;
}
export interface Vote {
  pollId: number;
  title: string;
  startAt: string;
  endsAt: string;
  colorChip: CalendarColorType | string;

  // 상세 조회 필드
  isEnded?: boolean;
  canVote?: boolean;
  optionType?: 'TEXT' | 'DATETIME';
  options?: VoteOption[];
  isVoted?: boolean;
  myVoteOptionIds?: number[];
  isMulti?: boolean;
  isAnonymous?: boolean;
  participationCount?: number;
  targetMemberCount?: number; // totalMemberCount와 혼용 시 하나로 통일 권장
  voters?: Participant[] | null;
}


// 달력 계산 및 포맷팅 유틸리티
export const CalendarUtils = {
  // 날짜 문자열 포맷팅 (YYYY-MM-DD)
  formatDate: (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  // 특정 날짜가 범위 내에 있는지 확인
  isDateInRange: (target: string, start: string, end: string) => {
    if (!start || !end) return false;
    const t = new Date(target).setHours(0,0,0,0);
    const s = new Date(start.split('T')[0]).setHours(0,0,0,0);
    const e = new Date(end.split('T')[0]).setHours(0,0,0,0);
    return t >= s && t <= e;
  },

  // 칩 너비 계산 (좌우 8px 여백 포함)
  calculateWidth: (displayDays: number) => {
    return (140 * displayDays) + (displayDays - 1) - 16;
  },
  
  // 두 날짜가 같은 날인지 확인
  isSameDay: (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate(),

  // D-day 계산 (시작일 - 기준일)
  getDiffDays: (targetDate: string, baseDate: Date = new Date()) => {
    if (!targetDate) return 0;
    const target = new Date(targetDate.split('T')[0]).getTime();
    const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();
    return Math.floor((target - base) / (1000 * 60 * 60 * 24));
  },

  // 카드용 날짜 포맷팅: 2026.01.28(수) 10:00
  formatDetailDate: (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}(${weekDays[date.getDay()]}) ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  getCalendarDays: (year: number, month: number) => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    const days = [];

    // 1. 지난 달 날짜
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        year: month === 0 ? year - 1 : year,
        month: month === 0 ? 11 : month - 1,
        day: prevLastDate - i,
        isCurrentMonth: false,
      });
    }

    // 2. 이번 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ year, month, day: i, isCurrentMonth: true });
    }

    // 3. 다음 달 날짜 (42칸 또는 35칸 정방형 유지)
    let totalSlots;
    if (days.length <= 28) totalSlots = 28;
    else if (days.length <= 35) totalSlots = 35;
    else totalSlots = 42;

    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ year, month: month + 1, day: i, isCurrentMonth: false });
    }

    return days;
  },

  /** * 종료일까지 남은 '일' 수 계산 (칩 너비 계산용)
   */
  getRemainingDays: (dateStr: string, endsAt: string) => {
    if (!dateStr || !endsAt) return 0;
    const start = new Date(dateStr).setHours(0, 0, 0, 0);
    const end = new Date(endsAt.split('T')[0]).setHours(0, 0, 0, 0);
    
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
};

// 컬러 칩 정의
export const CALENDAR_COLORS = [
  { id: 'blue', class: 'bg-chip-blue' },
  { id: 'gray', class: 'bg-chip-gray' },
  { id: 'pink', class: 'bg-chip-pink' },
  { id: 'orange', class: 'bg-chip-orange' },
  { id: 'green', class: 'bg-chip-green' },
] as const;

export type CalendarColorType = typeof CALENDAR_COLORS[number]['id'];