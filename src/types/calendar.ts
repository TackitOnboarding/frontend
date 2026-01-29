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
  }
};