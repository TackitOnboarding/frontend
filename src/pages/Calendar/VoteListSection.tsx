import { VoteCard } from "../../components/calendar/VoteCard";
import { CalendarUtils, type Vote} from "../../types/calendar";
import "./Calendar.css";

const mockVotes: Vote[] = [
  {
    vote_id: 1,
    title: "회식 메뉴 투표",
    starts_at: "2026-02-02T09:00:00",
    ends_at: "2026-02-04T23:59:59", // 오늘(2/2) 기준 D-2 (임박)
    color_chip: "gray",
    responses: [] // [미참여 + 임박] -> Urgent 상태 (빨간 테두리)
  },
  {
    vote_id: 2,
    title: "정기 회의 시간 확정",
    starts_at: "2026-02-01T10:00:00",
    ends_at: "2026-02-07T18:00:00", // D-5 (여유)
    color_chip: "blue",
    responses: [
      { voter_id: 123 } // [참여 완료] -> 체크 아이콘 표시 (흰색 배경)
    ]
  },
  {
    vote_id: 3,
    title: "동아리 굿즈 디자인 선정",
    starts_at: "2026-02-02T13:00:00",
    ends_at: "2026-02-05T23:59:59", // D-3 (임박)
    color_chip: "pink",
    responses: [
      { voter_id: 123 } // [참여 완료 + 임박] -> 체크 아이콘 (임박해도 참여했으므로 흰색 배경)
    ]
  },
  {
    vote_id: 4,
    title: "워크샵 장소 조사",
    starts_at: "2026-02-10T09:00:00",
    ends_at: "2026-02-15T18:00:00", // 먼 미래
    color_chip: "green",
    responses: [] // [미참여 + 여유] -> 기본 상태 (흰색 배경)
  }
];

export default function VoteListSection() {
  const now = new Date();
  const currentUserId = 123; // 실제 유저 ID (Context 등으로 관리 권장)
  const totalMemberCount = 50; // 실제 총 인원수

  // [수정] 1. 미래 투표 목록 필터링 및 종료 임박순 정렬
  // 투표는 시작일보다 '종료일'이 중요하므로 ends_at 기준으로 정렬하는 것이 일반적입니다.
  const upcomingVotes = mockVotes
    .filter(v => {
      const dDayToEnd = CalendarUtils.getDiffDays(v.ends_at, now);
      return dDayToEnd >= 0; // 오늘 포함 미래에 종료되는 투표들
    })
    .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
  return (
      <div className="flex flex-col items-start w-[282px] h-[290px] bg-background-neutral border border-line-normal gap-3 py-6 pl-6">
        <h2 className="text-body-1 text-label-normal">투표</h2>
  
        <div className="w-full flex-1 custom-sidebar-scroll">
          <div className="flex flex-col gap-3">
            {upcomingVotes.map((vote) => (
            <VoteCard
              key={vote.vote_id}
              data={vote}
              currentUserId={currentUserId}
              totalMemberCount={totalMemberCount}
            />
          ))}
          {upcomingVotes.length === 0 && (
              <p className="text-body-2 text-label-disable py-4 text-center">진행 중인 투표가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    )
}