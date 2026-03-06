import React, { useEffect, useState } from 'react'
import api from '../../api/api'

export type MyInfoData = {
  nickname: string
  email: string
  universityName: string;
  organization: string
  memberRole: 'ADMIN' | 'GENERAL' | string
  memberType: 'NEWBIE' | 'SENIOR' | string
  profileImageUrl: string | null
}

type MyInfoProps = {
  children: (myInfo: MyInfoData | null, loading: boolean) => React.ReactNode
}

const MyInfo: React.FC<MyInfoProps> = ({ children }) => {
  const [myInfo, setMyInfo] = useState<MyInfoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const savedProfile = localStorage.getItem('currentProfile')
    const userEmail = localStorage.getItem('userEmail')

    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      
      // 2. 새로운 데이터 규격에 맞춰 매핑
      setMyInfo({
        nickname: profile.nickname,
        email: userEmail || '-',
        organization: profile.orgName,
        universityName: profile.universityName,
        memberRole: profile.memberRole, // ADMIN | GENERAL
        memberType: profile.memberType, // NEWBIE | SENIOR
        profileImageUrl: profile.profileImage
      })
    }
    
    setLoading(false)
  }, [])

  // 렌더-프로프 방식
  return <>{children(myInfo, loading)}</>
}

export default MyInfo
