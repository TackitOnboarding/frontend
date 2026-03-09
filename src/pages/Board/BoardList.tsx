import React, { useState } from 'react'
import './BoardList.css'
import HomeBar from '../../components/HomeBar'
import Footer from '../../components/layouts/Footer'
import MyInfo from '../MyPage/MyInfo'
import BoardSection from "../../components/board/BoardSection"
import PopularPostsSection from '../Main/PopularPostsSection'

type BoardType = 'tip' | 'qna' | 'free'

export default function BoardList() {
  const [activeTab, setActiveTab] = useState<BoardType>('tip')

  const boardConfigs = {
    tip: {
      title:'선배가 알려줘요',
      banner: '/banners/tip-banner.svg',
      postType: 'TIP',
      writePath: `/board/write/tip`,
      detailPath: `tip`,
      allowedType: 'SENIOR',
      categories: [
        { label: '경험담 공유', value: 'EXPERIENCE' },
        { label: '교육&멘토링', value: 'MENTORING' },
        { label: '온보딩', value: 'ONBOARDING' },
        { label: '유용한 팁', value: 'USEFUL_TIP' },
        { label: '팀 문화', value: 'TEAM_CULTURE' },
      ]
    },
    qna: {
      title: '신입이 질문해요',
      banner: '/banners/qna-banner.svg',
      postType: 'QNA',
      writePath: `/board/write/qna`,
      detailPath: `qna`,
      allowedType: 'NEWBIE',
      categories: [
          { label: '문화적응', value: 'CULTURE_ADAPT' },
          { label: '소통고민', value: 'COMMUNICATION' },
          { label: '신입고민', value: 'JUNIOR_CONCERN' },
          { label: '운영&제도', value: 'SYSTEM' },
          { label: '활동질문', value: 'ACTIVITY_QUESTION' },
        ]
    },
    free: {
      title: '다같이 얘기해요',
      banner: '/banners/free-banner.svg',
      postType: 'FREE',
      writePath: `/board/write/free`,
      detailPath: `free`,
      allowedType: 'ALL',
      categories: [
        { label: '맛집추천', value: 'TASTY_RESTAURANT' },
        { label: '자료공유', value: 'RESOURCE_SHARE' },
        { label: '자유토론', value: 'DISCUSSION' },
        { label: '취미생활', value: 'HOBBY' },
        { label: '활동일상', value: 'DAILY_ACTIVITY' },
      ]
    }
  }
  const currentBoard = boardConfigs[activeTab]

  return (
    <MyInfo>
      {(myInfo, loading) => (
        <div className="flex flex-col min-h-screen">
          <HomeBar />
          <main className="flex-1">
            <div className="board-container">
              <div className="board-banner">
                <img  src={currentBoard.banner} alt={currentBoard.title} className="w-full object-cover"/>
              </div>

              <PopularPostsSection />

              <div className="board-section">
                <div className="flex justify-start gap-6">
                  {(Object.keys(boardConfigs) as BoardType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveTab(type)}
                      className={`pb-3 transition-all ${
                        'text-title-1 font-bold'
                      } ${
                        activeTab === type 
                          ? 'text-label-normal ' // 활성화: Label/normal
                          : 'text-label-disable' // 비활성화: Label/disable
                      }`}
                    >
                      {boardConfigs[type].title}
                    </button>
                  ))}
                </div>

                <div className="board-list">
                  <BoardSection 
                    key={activeTab}
                    config={currentBoard} 
                    myInfo={myInfo} 
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      )}
    </MyInfo>
  )
}