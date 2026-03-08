import api from "./api"
import { Schedule, Vote, Participant} from "../types/calendar"

export const calendarApi = {
  /**
   * [일정] 한달 일정 조회
   * @param year 연도
   * @param month 월
   */

  getMonthlyEvents: async (year: number, month: number) => {
    const activeId = localStorage.getItem('activeProfileId')
    const res = await api.get(`/api/events/monthly`, {
      params:{ year, month },
      headers: { 'Active-Profile-Id': activeId}
    })
    return res.data.content as Schedule[]
  },

  /**
   * [일정] 다가오는 일정 조회 (사이드바)
   */
  getUpcomingEvents: async () => {
    const activeId = localStorage.getItem('activeProfileId')
    const res = await api.get(`/api/events/upcoming`, {
      headers: { 'Active-Profile-Id': activeId}
    })
    return res.data.content as Schedule[]
  },

  /**
   * [일정]] 일정 상세 조회
   */
  getEventDetail: async (eventId: number) => {
    const activeId = localStorage.getItem('activeProfileId')
    const res = await api.get(`/api/events/${eventId}`, {
      headers: { 'Active-Profile-Id': activeId}
    })
    return res.data.content as Schedule[]
  },
  /**
   * [일정] 일정 생성
   * @cite 일정 생성 명세
   */
  createEvent: async (data: {
    orgId: number;
    title: string;
    startsAt: string;
    endsAt: string;
    description?: string | null;
    colorChip: string;
    eventScope: 'ALL' | 'PARTIAL';
    participants?: number[];
  }) => {
    const activeId = localStorage.getItem('activeProfileId');
    const res = await api.post(`/api/events`, data, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data; //
  },
  /**
   * [일정] 일정 수정
   * @param eventId 수정할 일정의 ID
   * @param data 수정할 데이터
   */
  updateEvent: async (eventId: number, data: {
    title?: string;
    startsAt?: string;
    endsAt?: string;
    description?: string | null;
    targetType?: 'ALL' | 'SELECT';
    participants?: number[];
    colorChip?: string;
  }) => {
    const activeId = localStorage.getItem('activeProfileId'); //
    const res = await api.patch(`/api/events/${eventId}`, data, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data; //
  },
  /**
   * [일정] 일정 삭제
   * @param eventId 삭제할 일정의 Id
   * @cite 일정 삭제 명세
   */
  deleteEvent: async (eventId: number) => {
    const activeId = localStorage.getItem('activeProfileId');
    const res = await api.delete(`/api/events/${eventId}`, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data;
  },

  /** 
   * [투표] 한달 투표 조회
   */
  getMonthlyPolls: async (year:number, month: number) => {
    const activeId = localStorage.getItem('activeProfileId')
    const res = await api.get(`/api/polls/monthly`, {
      params:{ year, month },
      headers: { 'Active-Profile-Id': activeId}
    })
    return res.data.content.map((poll: any) => ({
      ...poll,
      pollId: poll.id
    })) as Vote[]
  },
  /**
   * [투표] 마감 임박 및 진행 중인 투표 조회 (사이드바)
   */
  getActivePolls: async () => {
    const activeId = localStorage.getItem('activeProfileId')
    const res = await api.get(`/api/polls/monthly`, {
      headers: { 'Active-Profile-Id': activeId}
    })
    return res.data.content
  },
  /**
   * [투표] 투표 상세 조회
   */
  getPollDetail: async (pollId: number) => {
    const activeId = localStorage.getItem('activeProfileId')
    const res = await api.get(`/api/polls/${pollId}`, {
      headers: { 'Active-Profile-Id': activeId}
    })
    return res.data.content as Vote
  },
  /**
   * [투표] 투표하기 / 재투표하기
   */
  vote: async (pollId: number, optionIds: number[]) => {
    const activeId = localStorage.getItem('activeProfileId')
    const res = await api.post(`/api/polls/${pollId}/vote`, { optionIds }, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data
  },
  /**
   * [투표] 투표 생성
   * @cite 투표 생성 명세
   */
  createPoll: async (data: {
    orgId: number;
    title: string;
    endsAt: string;
    isMulti: boolean;
    isAnonymous: boolean;
    optionType: 'TEXT' | 'DATE';
    pollOptions: string[]; // 투표 항목들
    colorChip: string;
    pollScope: 'ALL' | 'PARTIAL';
    participants?: number[];
  }) => {
    const activeId = localStorage.getItem('activeProfileId');
    const res = await api.post(`/api/polls`, data, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data;
  },
  /**
   * [투표] 투표 수정
   * @param pollId 수정할 투표 ID
   * @param data 수정할 데이터
   */
  updatePoll: async (pollId: number, data: {
    title?: string;
    endsAt?: string | null;
    isMulti?: boolean;
    // targetType이나 participants 등은 회의 결과에 따라 추가 가능
  }) => {
    const activeId = localStorage.getItem('activeProfileId'); //
    const res = await api.patch(`/api/polls/${pollId}`, data, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data; //
  },
  /**
   * [투표] 투표 삭제
   * @param pollId 삭제할 투표 Id
   * @returns 투표 삭제 명시
   */
  deletePoll: async (pollId: number) => {
    const activeId = localStorage.getItem('activeProfileId');
    const res = await api.delete(`/api/polls/${pollId}`, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data;
  },
  /**
   * [공통] 모임 소속 인원 조회
   */
  getOrgMembers: async (orgId: number) => {
    const activeId = localStorage.getItem('activeProfileId');
    const res = await api.get(`/api/orgs/${orgId}/members`, {
      headers: { 'Active-Profile-Id': activeId }
    });
    return res.data.content as Participant[];
  }
}