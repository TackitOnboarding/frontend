import { VoteCard } from "../../components/calendar/VoteCard";
import { type Vote } from "../../types/calendar";
import { calendarApi } from "../../api/calendar";
import { useEffect, useState } from "react";



export default function VoteNoticeSection() {
  const [urgentVotes, setUrgentVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  // const currentUserId = 123; // 실제 로그인한 유저 ID
  const totalMemberCount = 50; // 모임의 총 인원수

  useEffect(() => {
    const fetchUrgentPolls = async () => {
      try {
        setLoading(true);
        // 마감 임박 및 진행 중인 투표 목록 조회 API 호출
        const data = await calendarApi.getActivePolls();
        
        // 💡 서버가 'urgentVotes' 필드에 마감 임박 데이터를 담아줍니다.
        // 데이터가 null로 올 수 있으므로 빈 배열 처리를 해줍니다.
        setUrgentVotes(data.urgentVotes || []);
      } catch (error) {
        console.error("마감 임박 투표 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentPolls();
  }, []);

  if (loading || urgentVotes.length === 0) return null;

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
            key={vote.pollId}
            data={vote}
            // currentUserId={currentUserId}
            totalMemberCount={totalMemberCount}
          />
        ))}
      </div>    
    </div>
  )
}