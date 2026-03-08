import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
// import { toast } from 'react-toastify'
import TagChips from '../TagChips'
import Pagination from '../Pagination'
import PostCard from '../posts/PostCard'
import WriteButton from '../ui/WriteButton'
import { stripHtml } from '../../utils/stripHtml'
import { hydrateCoverToken } from '../../utils/coverToken'

// 통합 Post 타입 정의
type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl?: string | null
  profileImageUrl?: string | null
}

export default function BoardSection({ config, myInfo, loading}: any) {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const activeProfileId = localStorage.getItem('activeProfileId')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/api/posts', {
          params: {
            type: config.postType, // 필수값
            category: activeCategory || undefined, // 없으면 전체
            page: currentPage - 1,
            size: 5
          },
          headers: {
            'Active-Profile-Id': activeProfileId // 명세 필수 헤더
          }
        })

        const { posts: postList, pageInfo } = res.data.content;
        
        setPosts(postList.map((p: any) => ({
          id: p.id,
          writer: p.writer.nickname,
          title: p.title,
          content: p.contentSummary, // 목록에서는 요약본 사용
          tags: [p.postCategory.label], // 카테고리 라벨을 태그로 활용
          createdAt: p.createdAt,
          imageUrl: p.thumbnail,
          profileImageUrl: p.writer.profileImageUrl
        })))
        setTotalPages(pageInfo.totalPages)
      } catch (error) {
        console.error("로딩 실패", error)
      }
    }
    fetchPosts()
  }, [currentPage, activeCategory, config])

  return (
    <div className="board-section-container">
      {/* 상단바: 태그칩 + 글쓰기 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <TagChips 
          includeAllItem
          categories={config.categories} // BoardList의 categories를 주입
          value={activeCategory} 
          onChange={(v) => {
            setActiveCategory(v); // '전체' 클릭 시 null이 전달됨
            setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
          }}
        />

        {/* 권한 체크 후 글쓰기 버튼 표시 */}
        {!loading && (config.allowedType === 'ALL' || myInfo?.memberType === config.allowedType) && (
          <WriteButton onClick={() => navigate(config.writePath)} />
        )}
      </div>

      {/* 리스트 영역 */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <img src="/icons/empty.svg" alt="Empty" className="w-20 h-20 mb-4" />
            <p className="text-gray-500">아직 작성한 글이 없어요!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={stripHtml(hydrateCoverToken(post.content, post.imageUrl ?? null))}
              writer={post.writer}
              createdAt={post.createdAt}
              tags={post.tags}
              imageUrl={post.imageUrl}
              profileImageUrl={post.profileImageUrl}
              onClick={() => navigate(`${config.detailPath}/${post.id}`)}
            />
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => {
            setCurrentPage(p)
            window.scrollTo({ top: 400, behavior: 'smooth' }) // 인기게시물 밑으로 스크롤
          }}
        />
      </div>
    </div>
  )
}