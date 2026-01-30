import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import clsx from 'clsx'

type OrgType = 'CLUB' | 'COMMUNITY'

const ICONS = {
  CLUB: {
    default: '/icons/club.svg',
    active: '/icons/selected-club.svg'
  },
  COMMUNITY: {
    default: '/icons/community.svg',
    active: '/icons/selected-community.svg'
  }
}

export default function OrganizationTypePage() {
  const [selectedType, setSelectedType] = useState<OrgType | null>(null)
  const location = useLocation();
  const navigate = useNavigate()

  const { mode = 'JOIN' } = location.state || {};

  const handleNext = () => {
    if (!selectedType) return;

    if (mode === 'CREATE' && selectedType === 'COMMUNITY') {
      navigate('/auth/organization/create', {
        state: {type: selectedType, mode }
      })
    }
    else {
      navigate('/auth/organization/search', { 
        state: { type: selectedType, mode }
    });
    }
  };

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard className="flex flex-col items-center justify-center w-full gap-8 max-w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        <h1 className="text-title1-bold text-label-normal">
          어떤 모임에 참여하시나요?
        </h1>
        <div className="flex gap-4">
          {/* 교내, 연합 동아리 */}
          <button
            type="button"
            onClick={() => setSelectedType('CLUB')}
            className={clsx(
              "flex flex-col w-[188px] h-[172px] items-center justify-center gap-4 p-4 rounded-lg border transition-all",
              selectedType === 'CLUB'
                ? 'border-line-active '
                : 'border-line-normal'
            )}
          >
            <img 
              src={selectedType === 'CLUB' ? ICONS.CLUB.active : ICONS.CLUB.default}
              alt="club" 
              className="w-15 h-15"
            />
            <span className={clsx(
              "text-body-1sb",
              selectedType === 'CLUB' ? 'text-label-primary' : 'text-label-normal'
            )}>
              교내 · 연합 동아리
            </span>
          </button>

          {/* 소모임 */}
          <button
            type="button"
            onClick={() => setSelectedType('COMMUNITY')}
            className={clsx(
              "flex flex-col w-[188px] h-[172px] items-center justify-center gap-4 p-4 rounded-lg border transition-all",
              selectedType === 'COMMUNITY'
                ? 'border-line-active '
                : 'border-line-normal'
            )}
          >
            <img 
              src={selectedType === 'COMMUNITY' ? ICONS.COMMUNITY.active : ICONS.COMMUNITY.default}
              alt="community"
              className="w-15 h-15"
            />
            <span className={clsx(
              "text-body-1sb",
              selectedType === 'COMMUNITY' ? 'text-label-primary' : 'text-label-normal'
            )}>
              소모임
            </span>
          </button>
        </div>

        <Button
          variant="primary"
          size="m"
          className="mx-auto h-12 w-[392px]"
          disabled={!selectedType}
          onClick={handleNext}
        >
          다음  
        </Button>
      </AuthCard>
    </AuthLayout>
  )
}