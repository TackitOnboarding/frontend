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
  const [tagId, setTagId] = useState<number | null>(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const size = 5

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isAll = tagId === 0 || tagId === null
        const url = isAll ? config.endpoint : config.tagPostUrl(tagId)

        const res = await api.get(url, {
          params: { page: currentPage - 1, size, sort: 'createdAt,desc' }
        })

        const data = res.data
        const contentArr = Array.isArray(data?.content) ? data.content : []
        
        // 통합 매핑 로직 (id와 postId가 혼용되는 문제 해결)
        const normalized: Post[] = contentArr.map((p: any) => ({
          id: p.postId ?? p.id,
          writer: p.writer ?? '',
          title: p.title ?? '',
          content: p.content ?? '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          createdAt: p.createdAt ?? '',
          imageUrl: p.imageUrl ?? null,
          profileImageUrl: p.profileImageUrl ?? null,
        }))

        setPosts(normalized)
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
      } catch (error) {
        console.error(`${config.title} 조회 실패:`, error)
        setPosts([])
        setTotalPages(1)
      }
    }
    fetchPosts()
  }, [currentPage, tagId, config])

  return (
    <div className="board-section-container">
      {/* 상단바: 태그칩 + 글쓰기 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <TagChips
          endpoint={config.tagEndpoint}
          mode="single"
          value={tagId}
          onChange={(v) => {
            setTagId(v as number | null)
            setCurrentPage(1)
          }}
          includeAllItem
          gapPx={10}
          fallbackTags={config.fallbackTags}
        />

        {/* 권한 체크 후 글쓰기 버튼 표시 */}
        {!loading && (config.role === 'ALL' || myInfo?.role === config.role) && (
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