import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import api from '../../../api/api'


export default function OrganizationSearchPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const { type: orgType, mode = 'JOIN' } = location.state || {};
  const isCreate = mode === 'CREATE'
  const isClub = orgType === 'CLUB'

  // 교내 동아리 서브 스텝
  const [subStep, setSubStep] = useState(1); 
  const [selectedSchool, setSelectedSchool] = useState<{id: number, name: string} | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([]);


  // 상단 바 개수 설정 (이미지 반영)
  const totalSteps = (!isCreate && isClub) ? 3 : 2;
  const currentProgress = subStep;

  // UI 문구 분기
  const getHeaderInfo = () => {
    const titleAction = isCreate ? '등록하기' : '참여하기';
    if (isClub) {
      return subStep === 1 
        ? { title: '학교 검색하기', desc: `연합 동아리일 경우 '연합'을 선택해주세요.`, placeholder: '학교 이름을 입력해 주세요.' }
        : { title: `동아리 ${titleAction}`, desc: null, placeholder: '모임 이름을 입력해 주세요.' };
    }
    return { title: `소모임 ${titleAction}`, desc: null, placeholder: '모임 이름을 입력해 주세요.' };
  };

  const header = getHeaderInfo();

  // 검색 로직(아직 debounce 미적용)
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      try {
        if (isClub && subStep === 1) {
          // 1. 대학교 검색 API 연결
          // Path: /api/universities/search, Param: word
          const res = await api.get('/universities/search', {
            params: { word: value }
          });
          
          // 제공해주신 명세에 따르면 응답이 바로 배열 형태입니다.
          setSearchResults(res.data); 
        } else {
          // 2. 모임 검색 API (기존 명세 기반 유지)
          const endpoint = isClub ? '/orgs/search' : '/orgs/search';
          const res = await api.get(endpoint, {
            params: { 
              query: value,
              ...(isClub && { universityId: selectedSchool?.id }),
              ...(!isClub && { orgType: 'COMMUNITY' })
            }
          });
          setSearchResults(res.data.content || res.data);
        }
      } catch (err) {
        console.error('검색 실패:', err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // 연합 버튼 클릭 핸들러
  const handleSelectUnion = () => {
    const unionData = { id: 0, name: "연합" };
    setSelectedSchool(unionData);
    setSearchTerm(unionData.name);
    setSearchResults([]);
  };

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard className="flex flex-col items-center justify-center w-full gap-8 max-w-[440px] translate-y-12 md:translate-y-20 lg:translate-y-28">
        {/* 상단 스테퍼 바 */}
        <div className="w-[392px] h-2 gap-2 flex ">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-colors ${
                i + 1 <= currentProgress ? 'bg-interaction-normal' : 'bg-interaction-disable'
              }`} 
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-title1-bold text-label-normal">{header.title}</h2>
          {isClub && (
            <p className="text-body1 text-label-neutral">
                {header.desc}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-between w-[392px] h-[256px]">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder={header.placeholder}
                value={searchTerm}
                onChange={handleSearch}
                className="w-full h-12 rounded-xl p-3 border border-line-normal outline-none placeholder:text-body-1 placeholder:text-label-assistive"
              />
              <img src="/icons/search.svg" alt="search" className="absolute p-0 -translate-y-1/2 bg-transparent border-0 cursor-pointer right-3 top-1/2 w-6 h-6" />
            </div>

            {/* 검색 결과 */}
            <div className="overflow-y-auto max-h-40">
              {searchResults.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    // 1. 클릭 시 input에 이름 채우기
                    setSearchTerm(item.name);
                    // 2. 선택 상태 업데이트
                    if (isClub && subStep === 1) {
                      setSelectedSchool(item);
                    } else {
                      setSelectedOrganization(item);
                    }
                    // 3. 선택 후 리스트를 닫기.
                    setSearchResults([]); 
                  }}
                  className="px-3 cursor-pointer text-body1 text-label-normal hover:text-interaction-hover transition-colors"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">

            {isClub && subStep === 1 && (
              <Button
                variant="outlined"
                size="m"
                className="w-full"
                onClick={handleSelectUnion}
              >
                연합
              </Button>
            )}

            <Button
              variant="primary"
              size="m"
              className="w-full"
              disabled={isClub &&subStep === 1 ? !selectedSchool : !selectedOrganization}
              onClick={() => {
                if (isClub && subStep === 1) {
                  if (isCreate) {
                    navigate('/organization/create', {
                      state: {type: orgType, mode, school: selectedSchool }
                    })
                  } else {
                  setSubStep(2);
                  setSearchTerm('');
                  setSearchResults([]);
                  }
                } else {
                  navigate('/organization/form', {
                    state: { type: orgType,  mode, school: selectedSchool, organization: selectedOrganization } });
                }
              }}
            >
              다음
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}