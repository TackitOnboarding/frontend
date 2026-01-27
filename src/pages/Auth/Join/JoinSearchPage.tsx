import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import api from '../../../api/api'


type JoinType = 'CAMPUS' | 'CLUB'

interface SearchResult {
  id: number;
  name: string;
}

export default function JoinSearchPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const joinType = location.state?.type as JoinType;

  // 교내 동아리 서브 스텝
  const [subStep, setSubStep] = useState(1); 
  const [selectedSchool, setSelectedSchool] = useState<SearchResult | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<SearchResult | null>(null);

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])


  const isCampus = joinType === 'CAMPUS'
  // 상단 바 개수 설정 (이미지 반영)
  const totalSteps = isCampus ? 3 : 2;
  const currentProgress = subStep;

  // UI 문구 분기
  const getHeaderInfo = () => {
    if (isCampus) {
      return subStep === 1 
        ? { title: '동아리 참여하기', desc: `연합 동아리일 경우 '연합'을 선택해주세요.`, placeholder: '학교 이름을 입력해 주세요.' }
        : { title: '동아리 참여하기', desc: null, placeholder: '모임 이름을 입력해 주세요.' };
    }
    return { title: '소모임 참여하기', desc: '', placeholder: '모임 이름을 입력해 주세요.' };
  };

  const header = getHeaderInfo();

  // 검색 로직(아직 debounce 미적용)
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim().length > 1) {
      const mockData = isCampus && subStep === 1 
        ? [{ id: 1, name: '서울대학교' }, { id: 2, name: '연합' }]
        : [{ id: 101, name: '데브코스 5기' }, { id: 102, name: '알고리즘 스터디' }];
      
      setSearchResults(mockData.filter(item => item.name.includes(value)));
      // try {
      //   const res = await api.get(`${header.apiEndpoint}?q=${value}`)
      //   setSearchResults(res.data || [])
      // } catch (err) {
      //   console.error('검색 실패:', err)
      // }
    } else {
      setSearchResults([])
    }
  }

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
          {isCampus && (
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
                    if (isCampus && subStep === 1) {
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

          <Button
            variant="primary"
            size="m"
            className="w-full mt-4"
            disabled={isCampus &&subStep === 1 ? !selectedSchool : !selectedOrganization}
            onClick={() => {
              if (isCampus && subStep === 1) {
                setSubStep(2);
                setSearchTerm('');
                setSearchResults([]);
              } else {
                navigate('/auth/join/form', { state: { type: joinType, school: selectedSchool, organization: selectedOrganization } });
              }
            }}
          >
            다음
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}