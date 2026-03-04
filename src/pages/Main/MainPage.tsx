import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import MainFooter from '../../components/layouts/MainFooter'
import api from '../../api/api'
import SectionList from '../../components/SectionList'
import './MainPage.css'
import OnboardingModal from '../../components/modals/OnboardingModal'

const ONBOARD_KEY = 'onboard.seen.v1'

type PostId = number
type BaseItem = {
  id: PostId
  title: string
  content: string
  writer: string
  createdAt: string
  tags?: string[]
  imageUrl?: string | null
  profileImageUrl?: string | null
}

const toBase = (x: any): BaseItem => ({
  id: x.id ?? x.postId,
  title: x.title,
  content: x.content ?? '',
  writer: x.writer ?? '',
  createdAt: x.createdAt,
  tags: x.tags ?? [],
  imageUrl: x.imageUrl ?? null,
  profileImageUrl: x.profileImageUrl ?? '/icons/mypage-icon.svg',
})

export default function MainPage() {
  const [notices, setNotices] = useState<{items: BaseItem[], total: number}>({ items: [], total: 1 })
  const [noticePage, setNoticePage] = useState(1)

  const [activities, setActivities] = useState<{items: BaseItem[], total: number}>({ items: [], total: 1 })
  const [activityPage, setActivityPage] = useState(1)

  // 2. 데이터 페칭 로직
  const fetchSection = async (url: string, page: number, setter: any) => {
    try {
      // 백엔드가 0-base라면 page - 1 처리
      const { data } = await api.get(`${url}?page=${page - 1}&size=3&sort=createdAt,desc`)
      setter({
        items: (data.content || []).map(toBase),
        total: data.totalPages || 1
      })
    } catch {
      setter({ items: [], total: 1 })
    }
  }

  // 페이지 변경 시마다 호출
  useEffect(() => { fetchSection('/api/notice-posts', noticePage, setNotices) }, [noticePage])
  useEffect(() => { fetchSection('/api/activity-posts', activityPage, setActivities) }, [activityPage])

  const { state } = useLocation() as {
    state?: { showOnboarding?: boolean; fromLogin?: boolean }
  }
  const [openOnboarding, setOpenOnboarding] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARD_KEY)

    // 1) 특정 라우팅에서 강제 노출하고 싶다면 (관리자 메뉴에서 온보딩 다시 보기 등)
    if (state?.showOnboarding) {
      setOpenOnboarding(true)
      return
    }

    // 2) 이미 온보딩 본 적 있으면 끝
    if (seen) return

    // 3) "로그인 → 메인으로 들어온 경우"에만 첫 온보딩 노출
    if (state?.fromLogin) {
      setOpenOnboarding(true)
    }
  }, [state?.showOnboarding, state?.fromLogin])

  const dismiss = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      // 한 번 본 뒤에는 다시 안 뜨도록 플래그 저장
      localStorage.setItem(ONBOARD_KEY, '1')
    }
    setOpenOnboarding(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-blue">
      <div className="mb-4">
        <HomeBar />
      </div>

      <main className="flex-1">
        <div className="home-container">
          {/* 배너: 아래 여백 112 */}
          <div className="home-banner !mb-[112px]">
            <img src="/banners/home-banner.svg" alt="홈 배너" />
          </div>

          {/* 1. 공지사항 (운영진 권한 예시: true) */}
          <SectionList
            title="공지"
            iconSrc="/icons/notice.svg"
            items={notices.items}
            currentPage={noticePage}
            totalPages={notices.total}
            onPageChange={setNoticePage}
            moreTo="/notice"
            showWriteButton={true} 
          />

          {/* 2. 활동일지 */}
          <SectionList
            title="활동일지"
            iconSrc="/icons/activity.svg"
            items={activities.items}
            currentPage={activityPage}
            totalPages={activities.total}
            onPageChange={setActivityPage}
            moreTo="/activity"
            showWriteButton={true}
          />

        </div>
      </main>

      <MainFooter />

      {openOnboarding && <OnboardingModal onClose={dismiss} />}
    </div>
  )
}