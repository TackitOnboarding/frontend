import { CalendarUtils, type Vote } from "../../types/calendar";
import { CardVariant } from "./CardVariants";

interface VoteCardProps {
  data: Vote;
  currentUserId: number; // 로그인한 사용자의 ID (참여 여부 확인용)
  totalMemberCount: number; // 모임의 총 인원수 (투표 참여율 계산용)
}

export const VoteCard = ({ data, currentUserId, totalMemberCount }: VoteCardProps) => {
  const now = new Date();
  const dDayToEnd = CalendarUtils.getDiffDays(data.ends_at, now);
  const isVoted = data.responses?.some((r: any) => r.voter_id === currentUserId);
  const participantCount = data.responses?.length || 0;

  // 마감 3일 전 이내(0~3일)이고 투표 안했으면 urgent
  const isUrgent = dDayToEnd >= 0 && dDayToEnd <= 3 && !isVoted;
  const status = isUrgent ? "urgent" : "default";

  return (
    <div className={CardVariant({ status })}>
        <div className="flex justify-between items-center w-[202px]">
          <div className="flex flex-col items-start gap-[2px]">
            <p className="text-caption-regular text-label-neutral">~{CalendarUtils.formatDetailDate(data.ends_at)}</p>
            <p className="text-body-1sb text-label-normal">{data.title}</p>
            <p className="text-caption-regular text-label-neutral">({participantCount}/{totalMemberCount} 참여)</p>
          </div>

          <img 
            src={isVoted ? "/icons/check-circle.svg" : "/icons/goToVote.svg"} 
            alt={isVoted ? "voted" : "go-to-vote"} 
            className="w-5 h-5 cursor-pointer" 
          />
        </div>
      </div>
  )
}