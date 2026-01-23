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
      endpoint: '/api/tip-posts',
      tagEndpoint: '/api/tip-tags/list',
      tagPostUrl: (id: number) => `/api/tip-tags/${id}/posts`,
      writePath: '/write/tip',
      detailPath: '/tip',
      role: 'SENIOR',
      fallbackTags: [{ id: 1, name: '업무팁' }, { id: 2, name: '협업' }, { id: 3, name: '툴' }, { id: 4, name: '커리어' }]
    },
    qna: {
      title: '신입이 질문해요',
      banner: '/banners/qna-banner.svg',
      endpoint: '/api/qna-posts',
      tagEndpoint: '/api/qna-tags/list',
      tagPostUrl: (id: number) => `/api/qna-tags/${id}/posts`,
      writePath: '/write/qna',
      detailPath: '/qna',
      role: 'NEWBIE',
      fallbackTags: [{ id: 1, name: '리액트' }, { id: 2, name: '백엔드' }, { id: 3, name: '배포' }, { id: 4, name: 'CS' }]
    },
    free: {
      title: '다같이 얘기해요',
      banner: '/banners/free-banner.svg',
      endpoint: '/api/free-posts',
      tagEndpoint: '/api/free_tags',
      tagPostUrl: (id: number) => `/api/free_tags/${id}/posts`,
      writePath: '/write/free',
      detailPath: '/free',
      role: 'ALL',
      fallbackTags: [{ id: 1, name: '업무팁' }, { id: 2, name: '인수인계' }, { id: 3, name: '조직문화' }]
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