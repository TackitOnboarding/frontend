import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../../components/layouts/AuthLayout';
import { AuthCard } from '../../../components/ui/AuthCard';
import { Button } from '../../../components/ui/Button';

export default function OrganizationCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { type, mode = 'JOIN' } = location.state || {};
  const isCampus = type === 'CAMPUS';
  const isCreate = mode === 'CREATE';

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard className="flex flex-col items-center justify-center w-full gap-8 max-w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        <div className="flex flex-col items-center justify-center w-[392px] gap-3">
          <img src="/icons/circle-check.svg" alt="check icon" className="w-7 h-7"/>
          <div className="flex flex-col items-center justify-center w-[392px] gap-1">
            <h2 className="text-title-2b text-label-normal">
              {isCampus ? '동아리' : '소모임'} {isCreate ? '등록이 완료됐어요' : '가입 신청이 완료됐어요'}
            </h2>
            <div className="flex flex-col text-center text-body-2 text-label-neutral">
              {isCreate ? (
                // CREATE 모드
                <>
                  <p>운영진으로서 모임을 관리하고 멤버를 초대할 수 있어요.</p>
                </>
              ) : (
                // JOIN 모드
                <>
                  <p>운영진의 승인이 완료되면 모임 활동을 바로 시작할 수 있어요.</p>
                  <p>승인이 완료되면 메일로 알려드릴게요!</p>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="m"
          className="w-full mt-4"
          onClick={() => navigate('/auth/profiles')}
        >
          메인으로 가기
        </Button>
      </AuthCard>
    </AuthLayout>
  )
}