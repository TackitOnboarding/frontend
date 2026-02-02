export interface Schedule {
  schedule_id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  color_chip: string;
  // ... 기타 필드
}

export interface Vote {
  vote_id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  color_chip: string;
  responses?: Array<{ voter_id: number }>;
  // ... 기타 필드
}

// 달력 계산 관련 순수 함수들
export const CalendarUtils = {
  // 날짜 문자열 포맷팅 (YYYY-MM-DD)
  formatDate: (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  // 특정 날짜가 범위 내에 있는지 확인
  isDateInRange: (target: string, start: string, end: string) => {
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
    const target = new Date(targetDate.split('T')[0]).getTime();
    const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();
    return Math.floor((target - base) / (1000 * 60 * 60 * 24));
  },

  // 카드용 날짜 포맷팅: 2026.01.28(수) 10:00
  formatDetailDate: (dateStr: string) => {
    const date = new Date(dateStr);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}(${weekDays[date.getDay()]}) ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};