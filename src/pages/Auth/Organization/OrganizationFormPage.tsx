import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../../components/layouts/AuthLayout';
import { AuthCard } from '../../../components/ui/AuthCard';
import { Button } from '../../../components/ui/Button';
import SegmentedSelect, { SelectOption } from '../../../components/forms/SegmentedSelect'
import TextField from '../../../components/forms/TextField';
import { useUserForm } from '../../../hooks/useUserForm';
import api from '../../../api/api'
import { toastError } from '../../../utils/toast';

type MemberRole = 'EXECUTIVE' | 'GENERAL' | 'ADMIN';
type MemberType = 'NEWBIE' | 'SENIOR';

const TYPE_ICONS: Record<MemberType, { src: string; alt: string }> = {
  NEWBIE: { src: '/icons/newbie.svg', alt: 'newbie icon' },
  SENIOR: { src: '/icons/senior.svg', alt: 'senior icon' },
}

const TYPE_MESSAGES: Record<MemberType, string> = {
  NEWBIE: '선배들의 경험을 확인하고 질문을 남길 수 있어요.',
  SENIOR: '신입에게 도움을 주고 TIP을 공유할 수 있어요.',
};

const JOIN_START_YEAR = 2015
const CALENDAR_ICON_PATH = '/icons/calendar.svg'

export default function OrganizationFormPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { type, organization} = location.state || {};
  const isClub = type === 'CLUB';

  // 드롭다운 옵션 (입사년도)
  const yearOptions = useMemo(() => {
    const endYear = new Date().getFullYear()
    return Array.from(
      { length: endYear - JOIN_START_YEAR + 1 },
      (_, i) => endYear - i
    )
  }, [])

  const {
    nickname,
    setNickname,
    nickHasError,
    nickMessage,
    setNickServerError,
    setNicknameCheckMessage,
    checkNicknameDuplicate,
  } = useUserForm();

  const [joinedYear, setJoinedYear] = useState<number | ''>('')
  const [memberRole, setMemberRole] = useState<MemberRole | ''>('');
  const [memberType, setMemberType] = useState<MemberType | ''>('');
  const [submitted, setSubmitted] = useState(false)

  // 3. 가입 연도 유효성 검사 (기존 로직 유지 및 최적화)
  const isYearEmpty = joinedYear === '';
  const isYearInvalid = !isYearEmpty && !yearOptions.includes(Number(joinedYear));

  // 에러 메시지 노출 조건: 제출을 눌렀거나, 유효하지 않은 값을 입력했을 때
  const showYearError = (submitted && isYearEmpty) || isYearInvalid;
  const joinedYearMessage = showYearError 
    ? (isYearEmpty ? '입사연도를 선택해 주세요.' : '유효한 연도를 선택해 주세요.') 
    : undefined;

  const canSubmit = 
    nickname && 
    !nickHasError && 
    !isYearEmpty && 
    !isYearInvalid &&
    memberRole && 
    memberType;

  const handleComplete = async () => {
    setSubmitted(true);
    if (!canSubmit) return;

    const orgId = organization?.id || organization?.orgId;

    const payload = { nickname, memberRole, memberType }

    try {
      const response = await api.post(`/api/orgs/${orgId}`, payload);

      if (response.status === 200) {      
        // 기존 저장된 정보 초기화
        localStorage.removeItem('userProfiles');
        localStorage.removeItem('activeProfileId');
        
        navigate('/organization/complete', { state: { type, mode: 'JOIN', orgName: organization?.name } });
      }
    } catch (error: any) {
      // 서버에서 닉네임 중복 에러가 발생한 경우
      const serverMessage = error.response?.data?.status?.message;
      
      if (serverMessage === "이미 존재하는 닉네임입니다.") { // 서버 에러 메시지 확인 필요
        setNicknameCheckMessage(''); // 성공 메시지 초기화
        setNickServerError('해당 모임에 이미 사용 중인 닉네임입니다.');
      } else {
        toastError(serverMessage || "참여 신청에 실패했습니다.");
      }
    }
  };

  const roleOptions: [SelectOption<MemberRole>, SelectOption<MemberRole>] = [
    { value: 'EXECUTIVE', label: '운영진' },
    { value: 'GENERAL', label: '일반회원' },
  ];

  const typeOptions: [SelectOption<MemberType>, SelectOption<MemberType>] = [
    { value: 'NEWBIE', label: '신입회원' },
    { value: 'SENIOR', label: '선배회원' },
  ];

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard className="flex flex-col items-center justify-center w-full gap-8 max-w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        {/* 스테퍼 (마지막 단계) */}
        <div className="w-[392px] h-2 gap-2 flex">
          {Array.from({ length: isClub ? 3 : 2}).map((_, i) => (
            <div key={i} className=" h-2 flex-1 rounded-full bg-interaction-normal"/>
          ))}
        </div>

        <h1 className="text-title1-bold text-label-normal">{isClub ? '동아리 참여하기' : '소모임 참여하기'}</h1>

        <div className="flex flex-col gap-4 w-[392px]">

          {/* 닉네임 */}
          <TextField
            label="닉네임"
            required
            value={nickname}
            uppermessage='이 모임에서 쓸 닉네임을 정해주세요. 모임마다 다르게 설정할 수 있어요.'
            placeholder="닉네임을 입력해 주세요."
            onChange={(e) => setNickname(e.target.value)}
            onBlur={checkNicknameDuplicate}
            showCount
            maxLength={10}
            invalid={nickHasError}
            message={nickMessage}
          />

          {/* 가입 연도 */}
          <TextField
            label="모임 가입연도"
            required
            readOnly // 드롭다운 선택 유도
            value={joinedYear === '' ? '' : String(joinedYear)}
            placeholder="가입연도를 선택해 주세요."
            onChange={() => {}} // readOnly이므로 비워둠
            onSelectOption={(v) => setJoinedYear(Number(v))}
            rightIconSrc={CALENDAR_ICON_PATH}
            dropdownOptions={yearOptions}
            invalid={showYearError}
            message={joinedYearMessage}
          />

          {/* 회원 유형 */}
          <SegmentedSelect
            label="회원 유형"
            options={roleOptions}
            value={memberRole}
            onChange={setMemberRole}
          />

          {/* 역할 선택 */}
          <div>
            <SegmentedSelect
              label="역할"
              descriptionText={`올해 입사자의 경우 신입으로, 아닌 경우 선배로 선택해주세요!\n(올해 신입이라면 내년부터는 선배로 자동 전환돼요)`}
              options={typeOptions}
              value={memberType}
              onChange={setMemberType}
            />
            {/* 시안의 정보 안내 박스 */}
            {memberType ? (
              // [선택 후] 역할별 전용 혜택 박스 (파란색 배경)
              <div className="mt-3 flex items-center h-12 w-full rounded-lg bg-[#EEF2FF] pl-3 pr-4 gap-2 transition-all">
                <img
                  src={TYPE_ICONS[memberType].src}
                  alt={TYPE_ICONS[memberType].alt}
                  className="w-5 h-5 shrink-0"
                />
                <div className="flex flex-col">
                  <p className="text-body-2 text-label-normal">
                    {TYPE_MESSAGES[memberType]}
                  </p>
                </div>
              </div>
            ) : (
              // [선택 전] 기본 안내 박스 (회색 배경)
              <div className="flex items-center gap-2 p-3 mt-3 rounded-lg bg-background-neutral">
                <img src="/icons/icon-default.svg" className="w-5 h-5" alt="info" />
                <p className="text-body-2 text-label-normal">
                  선택한 역할에 따라 작성 가능한 게시판이 달라요.
                </p>
              </div>
            )}
          </div>

          {/* 제출 */}
          <Button
            variant="primary"
            size="m"
            className="w-full mt-4"
            disabled={!canSubmit}
            onClick={handleComplete}
          >
            완료
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}