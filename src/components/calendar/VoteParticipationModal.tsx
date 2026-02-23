import { useState, useEffect } from 'react';
import { RegisterModal } from "../modals/RegisterModal";
import { Button } from '../ui/Button';

export const VoteParticipationModal = ({ isOpen, onClose, data, onEdit }: any) => {
  // 내가 투표한 옵션 아이디들을 초기값으로 설정
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && data) {
      setSelectedOptionIds(data.myVoteOptionIds || []);
    }
  }, [isOpen, data]);

  if (!isOpen || !data || !data.options) return null;

  // 날짜 포맷팅 함수 추가 (예: 2026년 1월 10일 (토))
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

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
    const payload = { optionIds: selectedOptionIds }; // 단일 투표도 리스트로 전달
    console.log("투표 API 호출 [POST]:", payload);
    // 성공 시 로직 및 모달 닫기
    onClose();
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
          <h2 className="text-title-2b text-label-normal border border-b border-line-normal">{data.title}</h2>
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
                    {!data.isVoted ? (
                      isSelected ? (
                        /* 시안: 누르면 파란 배경에 흰색 체크 아이콘 */
                        <img src="/icons/check-circle-blue.svg" alt="selected" className="w-6 h-6" />
                      ) : (
                        /* 시안: 기본 회색 원 테두리 */
                        <div className="w-6 h-6 rounded-full border-2 border-line-normal bg-white" />
                      )
                    ) : (
                      /* 2. 투표 결과 모드 (isVoted가 true일 때) */
                      isMyPick && <img src="/icons/blue-check.svg" alt="my pick" className="w-5 h-5" />
                    )}
                    
                    <span className={`text-body-1 ${isMyPick || isSelected ? 'text-label-normal' : 'text-label-neutral'}`}>
                      {data.optionType === 'DATETIME' ? formatDate(option.content) : option.content}
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
          {data.isVoted ? (
            <>
              <Button variant="outlined" className="flex-1" onClick={handleVoteSubmit}>다시 투표하기</Button>
              <Button variant="outlined" className="flex-1" onClick={onEdit}>수정</Button>
            </>
          ) : (
            <Button variant="primary" className="w-full" onClick={handleVoteSubmit} disabled={selectedOptionIds.length === 0}>완료</Button>
          )}
        </div>
      </div>
    </RegisterModal>
  );
};