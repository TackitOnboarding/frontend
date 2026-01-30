import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../../components/layouts/AuthLayout'
import { AuthCard } from '../../../components/ui/AuthCard'
import { Button } from '../../../components/ui/Button'
import api from '../../../api/api'


type OrgType = 'CLUB' | 'COMMUNITY'

interface SearchSchoolResult {
  id: number;
  name: string;
}

interface SearchClubResult {
  id: number;
  schoolId: number;
  name: string;
}

// 작업 확인용 목데이터
const MOCK_SCHOOLS: SearchSchoolResult[] = [
  { id: 1, name: "숙명여자대학교" },
  { id: 2, name: "서울대학교" },
  { id: 3, name: "연세대학교" },
];

const MOCK_CLUBS: SearchClubResult[] = [
  { id: 1, schoolId: 1, name: "DACOS" },
  { id: 2, schoolId: 1, name: "SOLUX" },
  { id: 3, schoolId: 1, name: "APPS" },
  { id: 10, schoolId: 0, name: "연합 러닝크루" }, // 연합 동아리 예시
  { id: 11, schoolId: 0, name: "대학생 토론연합" },
];

const MOCK_COMMUNITIES = [
  { id: 101, name: "아침 러닝" },
  { id: 102, name: "경도" },
];


export default function OrganizationSearchPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const { type: orgType, mode = 'JOIN' } = location.state || {};
  const isCreate = mode === 'CREATE'
  const isClub = orgType === 'CLUB'

  // 교내 동아리 서브 스텝
  const [subStep, setSubStep] = useState(1); 
  const [selectedSchool, setSelectedSchool] = useState<SearchSchoolResult | null>(null);
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
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim().length > 0) {
      if (isClub) {
        if (subStep === 1) {
          // 학교 검색
          setSearchResults(MOCK_SCHOOLS.filter(s => s.name.includes(value)));
        } else {
          // 선택된 학교 ID에 해당하는 동아리만 검색
          setSearchResults(MOCK_CLUBS.filter(c => 
            c.schoolId === selectedSchool?.id && c.name.includes(value)
          ));
        }
      } else {
        // 소모임 검색
        setSearchResults(MOCK_COMMUNITIES.filter(c => c.name.includes(value)));
      }
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
                    navigate('/auth/organization/create', {
                      state: {type: orgType, mode, school: selectedSchool }
                    })
                  } else {
                  setSubStep(2);
                  setSearchTerm('');
                  setSearchResults([]);
                  }
                } else {
                  navigate('/auth/organization/form', {
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