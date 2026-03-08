import { useState, useEffect,  useRef } from 'react';
import { calendarApi } from '../../api/calendar';
import { type Vote } from '../../types/calendar';
import { RegisterModal } from "../modals/RegisterModal";
import { Button } from '../ui/Button';

interface VoteParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Vote | null;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSuccess?: () => void;
}

export const VoteParticipationModal = ({ isOpen, onClose, data, onEdit, onDelete, onSuccess }: VoteParticipationModalProps) => {
  // 내가 투표한 옵션 아이디들을 초기값으로 설정
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 수정/삭제 드롭다운 상태
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && data) {
      setSelectedOptionIds(data.myVoteOptionIds || []);
    }
  }, [isOpen, data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen || !data || !data.options) return null;

  // 마감 임박 알림 계산 (KST 기준)
  const getDeadlineBanner = () => {
    const now = new Date();
    const end = new Date(data.endsAt);
    const diff = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (data.isEnded) return { msg: "종료된 투표입니다.", color: "text-label-disable" };
    if (diffDays <= 3 && diffDays > 0) {
      return { msg: `투표가 ${diffDays === 1 ? '곧' : diffDays + '일 후'} 종료됩니다.`, color: "text-status-error" };
    }
    return null;
  };

  const banner = getDeadlineBanner();

  // 투표하기 / 재투표하기 핸들러
  const handleVoteSubmit = async () => {
    if (selectedOptionIds.length === 0) return;
    try {
      await calendarApi.vote(data.pollId, selectedOptionIds);
      onSuccess?.(); // 데이터 갱신
      onClose();
    } catch (error) {
      console.error("투표 실패:", error);
    }
  };

  return (
    <RegisterModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-8 px-6">
        {/* 상단 알림 배너 */}
        {banner && (
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-background-red text-system-red">
            <div className="flex items-center gap-2">
              <img src="/icons/info.svg" className="w-5 h-5" alt="info" />
            <span className={`text-body-1sb ${banner.color}`}>{banner.msg}</span>
            </div>
            <span className="text-body-2 text-label-neutral">~{data.endsAt.split('T')[0]}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-title-2b text-label-normal border border-b border-line-normal">{data.title}</h2>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <img src="/icons/More.svg" alt="more" className="w-6 h-6" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-10 w-[65px] bg-white border border-line-normal rounded-lg px-5 py-2 gap-1">
                  <button 
                    onClick={() => { onEdit(data.pollId); setIsMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-body-2 text-label-normal hover:bg-background-secondary border-b border-line-normal"
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => { onDelete(data.pollId); setIsMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-body-2 text-status-error hover:bg-background-secondary"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div> 
          
          <div className="flex gap-3 text-body-1 text-label-neutral">
            <span>{data.isMulti ? '복수 선택' : '단일 선택'}</span>
            <span>|</span>
            <span>{data.isAnonymous ? '익명 투표' : '공개 투표'}</span>
          </div>
        </div>

        {/* 투표 항목 리스트 */}
        <div className="flex flex-col gap-3">
          {data.options.map((option: any) => {
            // 내가 투표한 항목인지 여부
            const isMyPick = data.myVoteOptionIds?.includes(option.id);
            // 현재 선택 중인 항목인지 (참여 모드용)
            const isSelected = selectedOptionIds.includes(option.id);
            // 투표 결과 비율 계산
            const ratio = (option.voteCount / (data.participationCount || 1)) * 100;

            return (
              <div 
                key={option.id}
                onClick={() => {
                  if (!data.canVote || data.isEnded) return;
                  setSelectedOptionIds(prev => {
                    if (data.isMulti) {
                      return prev.includes(option.id) ? prev.filter(id => id !== option.id) : [...prev, option.id];
                    }
                    return [option.id];
                  });
                }}
                className="relative w-full flex flex-col gap-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* 1. 투표 참여 모드 (isVoted가 false일 때) */}
                    {isSelected ? (
                      <img src="/icons/check-circle-blue.svg" alt="selected" className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-line-normal bg-white" />
                    )}
                    
                    <span className={`text-body-1 ${isSelected ? 'text-label-normal font-bold' : 'text-label-neutral'}`}>
                      {option.content}
                    </span>
                    
                  </div>
                  {/* 결과 모드일 때만 우측에 표 수 노출 */}
                  {data.isVoted && (
                    <span className="text-body-1sb text-interaction-normal">{option.voteCount}표</span>
                  )}
              </div>

              {/* 3. 투표 결과 바 (진행 바) - 투표 참여 후에만 노출 */}
              {data.isVoted && (
                <div className="relative w-full h-1.5 bg-line-normal/30 rounded-full overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${isMyPick ? 'bg-interaction-normal' : 'bg-label-disable'}`}
                    style={{ width: `${ratio}%` }} 
                  />
                </div>
              )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-body-2 text-label-neutral">
          <div className="flex items-center gap-1">
             <img src="/icons/Person.svg" alt="participants" className="w-5 h-5 opacity-40" />
             <span>{data.participationCount}명 / {data.targetMemberCount}명 참여</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button 
            variant={data.isVoted ? "outlined" : "primary"} 
            className="w-full h-12" 
            onClick={handleVoteSubmit}
            disabled={selectedOptionIds.length === 0 || data.isEnded}
          >
            {data.isVoted ? "다시 투표하기" : "투표 완료"}
          </Button>
        </div>
      </div>
    </RegisterModal>
  );
};