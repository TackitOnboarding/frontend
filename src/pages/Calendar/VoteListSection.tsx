import { VoteCard } from "../../components/calendar/VoteCard";
import { CalendarUtils, type Vote} from "../../types/calendar";
import { calendarApi } from "../../api/calendar";
import { useEffect, useState } from "react";
import "./Calendar.css";


export default function VoteListSection() {
  const [upcomingVotes, setUpcomingVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = 123; 
  const totalMemberCount = 50;

  useEffect(() => {
    const fetchActivePolls = async () => {
      try {
        setLoading(true);
        // 진행 중인 투표 목록 조회 API 호출
        const data = await calendarApi.getActivePolls();
        
        // 💡 명세서의 'votes' 배열을 사용하며, endsAt(CamelCase) 기준으로 정렬합니다.
        const sortedVotes = (data.votes || []).sort(
          (a: Vote, b: Vote) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
        );
        
        setUpcomingVotes(sortedVotes);
      } catch (error) {
        console.error("투표 목록 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePolls();
  }, []);

  return (
      <div className="flex flex-col items-start w-[282px] h-[290px] bg-background-neutral border border-line-normal border-t-0 gap-3 py-6 pl-6">
        <h2 className="text-body-1 text-label-normal">투표</h2>
  
        <div className="w-full flex-1 custom-sidebar-scroll">
          <div className="flex flex-col gap-3">
            {upcomingVotes.map((vote) => (
            <VoteCard
              key={vote.pollId}
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