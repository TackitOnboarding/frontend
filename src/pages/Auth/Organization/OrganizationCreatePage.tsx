import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../../components/layouts/AuthLayout';
import { AuthCard } from '../../../components/ui/AuthCard';
import { Button } from '../../../components/ui/Button';
import TextField from '../../../components/forms/TextField';
import { useUserForm } from '../../../hooks/useUserForm';
import api from '../../../api/api'
import { toastError } from '../../../utils/toast';


export default function OrganizationCreatePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { type, school } = location.state || {};
  const isClub = type === 'CLUB';

  //  모임 이름 중복 테스트를 위해 useUserForm 활용
  const {
    organizationName,
    setOrganizationName,
    orgNameHasError,
    orgNameMessage,
    checkOrganizationNameDuplicate,
  } = useUserForm();

  const [description, setDescription] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrganizationName(e.target.value);
    // setIsNameUnique(false);  
  };

  const handleCheckDuplicate = async () => {
    if (!organizationName) return;
    await checkOrganizationNameDuplicate(school?.name);
  };

  const canSubmit = organizationName.trim() !== "" && !orgNameHasError && orgNameMessage === "사용 가능한 이름입니다.";

  const handleComplete = async () => {
    if (!canSubmit) return;

    try{
      const payload = {
        orgName: organizationName,   // 사용자가 입력한 이름
        orgType: type,            // 'COMMUNITY'
        orgDescription: description, // 사용자가 입력한 설명
        ...(type === 'CLUB' && school?.id && { universityId: Number(school.id) }),
      };

    await api.post('/api/orgs', payload);

    navigate('/organization/complete', { 
      state: { 
        type, 
        mode: 'CREATE', 
        orgName: organizationName 
      } 
    });
  } catch (error) {
    console.error("모임 생성 실패", error);
    toastError("모임 생성에 실패했습니다.");
  }
};


  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard className="flex flex-col items-center justify-center w-full gap-8 max-w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        {/* 스테퍼 (마지막 단계) */}
        {isClub && (
          <div className="w-[392px] h-2 gap-2 flex">
            <div className="h-2 flex-1 rounded-full bg-interaction-normal" />
            <div className="h-2 flex-1 rounded-full bg-interaction-normal" />
          </div>
        )}

        <h1 className="text-title1-bold text-label-normal">{isClub ? '동아리 등록하기' : '소모임 등록하기'}</h1>

        <div className="flex flex-col gap-4 w-[392px]">

          {/* 닉네임 */}
          <TextField
            label="모임 이름"
            required
            value={organizationName}
            placeholder="모임 이름을 입력해 주세요."
            onChange={handleNameChange}
            onBlur={handleCheckDuplicate}
            showCount
            maxLength={10}
            invalid={orgNameHasError}
            message={orgNameMessage}
          />

          {/* 모임 설명 */}
          <TextField
            label="모임 설명"
            value={description}
            placeholder="모임 설명을 입력해 주세요."
            onChange={(e) => setDescription(e.target.value)}
          />

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