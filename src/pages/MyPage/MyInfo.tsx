import React, { useEffect, useState } from 'react'
import api from '../../api/api'

export type MyInfoData = {
  nickname: string
  email: string
  universityName: string | null
  organization: string
  memberRole: 'EXECUTIVE' | 'GENERAL' | string
  memberType: 'NEWBIE' | 'SENIOR' | string
  imageUrl: string | null
}

type MyInfoProps = {
  children: (myInfo: MyInfoData | null, loading: boolean) => React.ReactNode
}

const MyInfo: React.FC<MyInfoProps> = ({ children }) => {
  const [myInfo, setMyInfo] = useState<MyInfoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        setLoading(true)

        // 2. 서버에서 최신 유저 정보와 전체 프로필 리스트를 가져옴
        const res = await api.get('/api/members/me')
        const { email, profiles } = res.data

        // 3. 사용자가 ProfileSelectPage에서 선택했던 '그 프로필 ID'를 로컬에서 확인
        const activeId = localStorage.getItem('activeProfileId')

        // 4. 전체 리스트 중 현재 활성화된 '단 1개의 프로필'만 필터링
        const current = Array.isArray(profiles) 
          ? profiles.find((p: any) => String(p.profileId) === activeId)
          : null

        if (current) {
          // 5. 찾은 1개의 프로필 객체를 UI 규격에 맞춰 매핑
          setMyInfo({
            nickname: current.nickname,
            email: email || '-',
            organization: current.orgName,
            universityName: current.universityName,
            memberRole: current.memberRole, 
            memberType: current.memberType, 
            imageUrl: current.imageUrl
          })
        } else {
          // 만약 일치하는 프로필이 없다면(예: 새로고침 후 첫 진입 등) 처리
          setMyInfo(null)
        }
      } catch (err) {
        console.error("내 정보(마이페이지) 로드 실패:", err)
        setMyInfo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMyInfo()
  }, [])

  // 렌더-프로프 방식
  return <>{children(myInfo, loading)}</>
}

export default MyInfo
