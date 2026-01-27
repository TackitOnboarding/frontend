import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import clsx from 'clsx'

type JoinType = 'CAMPUS' | 'CLUB'

const ICONS = {
  CAMPUS: {
    default: '/icons/campus.svg',
    active: '/icons/selected-campus.svg'
  },
  CLUB: {
    default: '/icons/club.svg',
    active: '/icons/selected-club.svg'
  }
}

export default function JoinTypePage() {
  const [selectedType, setSelectedType] = useState<JoinType | null>(null)
  const navigate = useNavigate()

  const handleNext = () => {
    if (!selectedType) return
    // 선택한 타입에 따라 검색 페이지로 이동 (state로 타입 전달)
    navigate('/auth/join/search', { state: { type: selectedType } })
  }

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
            onClick={() => setSelectedType('CAMPUS')}
            className={clsx(
              "flex flex-col w-[188px] h-[172px] items-center justify-center gap-4 p-4 rounded-lg border transition-all",
              selectedType === 'CAMPUS'
                ? 'border-line-active '
                : 'border-line-normal'
            )}
          >
            <img 
              src={selectedType === 'CAMPUS' ? ICONS.CAMPUS.active : ICONS.CAMPUS.default}
              alt="campus" 
              className="w-15 h-15"
            />
            <span className={clsx(
              "text-body-1sb",
              selectedType === 'CAMPUS' ? 'text-label-primary' : 'text-label-normal'
            )}>
              교내 · 연합 동아리
            </span>
          </button>

          {/* 소모임 */}
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