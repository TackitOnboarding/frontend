import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
// import api from '../../../api/api'

interface Profile {
  memberOrgId: number
  orgName: string
  orgType: string
  nickname: string
  profileImage: string | null
  memberType: string
  memberRole: string
}

const BADGE_ICONS = {
  ADMIN: '/icons/executive.svg',   // 운영진
  SENIOR: '/icons/senior.svg', // 선배
  NEWBIE: '/icons/newbie.svg', // 신입
} as const;

const getBadgeInfo = (role: string, type: string) => {
  if (role === 'ADMIN') return { src: BADGE_ICONS.ADMIN, label: '운영진' };
  if (type === 'SENIOR') return { src: BADGE_ICONS.SENIOR, label: '선배' };
  if (type === 'NEWBIE') return { src: BADGE_ICONS.NEWBIE, label: '신입' };
  return null;
};


export default function ProfileSelectPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('userProfiles');
    if (stored) {
      try {
        setProfiles(JSON.parse(stored));
      } catch(e) {
        console.error("프로필 데이터 파싱 에러", e);
      }
    }
  }, []);

  const handleProfileClick = (profile: Profile) => {
    localStorage.setItem('currentOrgId', String(profile.memberOrgId));
    localStorage.setItem('currentNickname', profile.nickname);
    
    navigate(`/${profile.memberOrgId}/main`); 
  };

  const handleJoinOrganization = () => {
    navigate('/organization/type', {
      state: {mode: 'JOIN'}
    })
  }

  const handleCreateOrganization = () => {
    navigate('/organization/type', {
      state: {mode: 'CREATE'}
    })
  }

  return (
    <AuthLayout showCornerLogo={true}>
      <div className="flex flex-col items-center justify-center gap-[100px] min-h-[400px]">
        <div className="flex flex-col items-center justify-center gap-12">
          {/* 헤더 텍스트 */}
          <h1 className="text-center text-title1-bold text-label-normal">
            {profiles.length > 0 ? (
              '참여할 모임을 선택해 주세요.'
            ) : (
              <>
                아직 참여 중인 모임이 없어요.<br />
                새 모임을 만들거나, 참여해보세요!
              </>
            )}
          </h1>

          <div className="flex flex-wrap justify-center gap-[60px]">
            {/* 이미 가입된 프로필 리스트(default) */}
            {profiles.map((profile) => {
              const badge = getBadgeInfo(profile.memberRole, profile.memberType);
              return (
                <div
                  key={profile.memberOrgId}
                  className="flex flex-col items-center cursor-pointer group gap-6"
                  onClick={() => handleProfileClick(profile)}
                >
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center">
                    <img src="/icons/profile-default.svg" alt="organization" className="w-[30px] h-[30px]" />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-title-2m text-label-normal">{profile.orgName}</span>
                    <div className="flex gap-[2px] items-center justify-center">
                      <p className="text-body-1 text-label-neutral">{profile.nickname}</p>
                      {/* 배지 아이콘 렌더링 */}
                      {badge && (
                        <img 
                          src={badge.src} 
                          alt={badge.label}
                          title={badge.label} // 마우스 호버 시 툴팁
                          className="w-4 h-4 object-contain" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 모임 참여하기 버튼 */}
            <div
              className=" flex flex-col items-center cursor-pointer group gap-6"
              onClick={handleJoinOrganization}
            >
              <div className="w-[30px] h-[30px] gap-[10px]">
                <img src="/icons/create.svg" alt="모임 참여하기" className="w-14 h-14"/>
              </div>
              <span className="text-title-2m text-label-normal">모임 참여하기</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <p className="text-body-2 text-label-normal">운영진이신가요?</p>
          <button
           onClick={handleCreateOrganization}
           className="text-body-1sb text-label-primary"
          >
            새로운 모임 등록하기
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}