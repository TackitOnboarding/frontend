import { VoteCard } from "../../components/calendar/VoteCard";
import { CalendarUtils, type Vote } from "../../types/calendar";

const mockVotes: Vote[] = [
  {
    vote_id: 1,
    title: "회식 메뉴 투표",
    starts_at: "2026-01-30T09:00:00",
    ends_at: "2026-02-04T23:59:59", // 오늘(2/2) 기준 D-2 (임박)
    color_chip: "gray",
    responses: [] // 미참여 상태
  }
];

export default function VoteNoticeSection() {
  const now = new Date();
  const currentUserId = 123; // 실제 로그인한 유저 ID
  const totalMemberCount = 50; // 모임의 총 인원수

  // 1. 마감 3일 이내 + 미참여 투표 필터링
  const urgentVotes = mockVotes.filter((vote) => {
    const dDayToEnd = CalendarUtils.getDiffDays(vote.ends_at, now);
    const isVoted = vote.responses?.some((r: any) => r.voter_id === currentUserId);
    
    // 마감 기한이 오늘 포함 0~3일 남았고, 아직 투표하지 않은 경우
    return dDayToEnd >= 0 && dDayToEnd <= 3 && !isVoted;
  });

  // 임박한 투표가 없으면 섹션 자체를 숨기거나 안내 문구를 바꿀 수 있습니다.
  if (urgentVotes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 px-6 pb-6">
      <div className="flex flex-col items-start justify-center gap-1">
        <div className="flex gap-2 items-center">
          <img src="/icons/info.svg" alt="info" className="w-5 h-5" />
          <p className="text-body-1sb text-system-red">지금 참여할 투표</p>
        </div>
        <p className="text-body-2 text-label-normal">
          아직 투표에 참요하지 않았어요.
          투표를 완료해주세요!
        </p>
      </div>

      {/* 미참여 투표 */}
      <div>
        {urgentVotes.map((vote) => (
          <VoteCard 
            key={vote.vote_id}
            data={vote}
            currentUserId={currentUserId}
            totalMemberCount={totalMemberCount}
          />
        ))}
      </div>    
    </div>
  )
}