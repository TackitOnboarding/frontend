import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import TagChips from '../../components/TagChips'
import CommentRowCompact from '../../components/posts/CommentRowCompact'
import PaginationGroup from '../../components/Pagination'
import api from '../../api/api'
import './MyPageContainer.css'

type Tab = 'qna' | 'free'
type PostType = 'QnA' | 'Free'

type CommentItem = {
  commentId: number
  postId: number
  content: string
  createdAt: string
  type: PostType
}

type PostSummary = {
  title: string
}

const TAB_TAGS: Array<{ id: Tab; name: string }> = [
  { id: 'qna', name: '신입이 질문해요' },
  { id: 'free', name: '다같이 얘기해요' },
]

export default function MyCommentList() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('qna')
  const [comments, setComments] = useState<CommentItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // postId별 제목 캐시
  const postCache = useRef(new Map<string, PostSummary>())
  // 캐시가 갱신되면 렌더를 다시 한번 일으키기 위한 tick
  const [cacheTick, setCacheTick] = useState(0)

  const size = 5
  const sortOrder = 'desc'
  const keyOf = (t: PostType, id: number) => `${t}:${id}`

  async function fetchPostSummary(
    type: PostType,
    id: number
  ): Promise<PostSummary> {
    const url =
      type === 'QnA' ? `/api/qna-posts/${id}` : `/api/free-posts/${id}`
    const { data } = await api.get(url)
    return { title: data.title ?? '(제목 없음)' }
  }

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)

        const endpoint =
          activeTab === 'free'
            ? `/api/mypage/free-comments?page=${
                currentPage - 1
              }&size=${size}&sort=createdAt,${sortOrder}`
            : `/api/mypage/qna-comments?page=${
                currentPage - 1
              }&size=${size}&sort=createdAt,${sortOrder}`

        const res = await api.get(endpoint)
        if (!mounted) return

        const list: CommentItem[] = res.data?.content ?? []
        setComments(list)
        setTotalPages(res.data?.totalPages ?? 1)

        const missing = list.filter(
          (c) => !postCache.current.has(keyOf(c.type, c.postId))
        )

        if (missing.length) {
          await Promise.all(
            missing.map(async (c) => {
              try {
                const summary = await fetchPostSummary(c.type, c.postId)
                postCache.current.set(keyOf(c.type, c.postId), summary)
              } catch {
                postCache.current.set(keyOf(c.type, c.postId), {
                  title: `(게시글 #${c.postId})`,
                })
              }
            })
          )
          if (mounted) setCacheTick((t) => t + 1)
        }
      } catch (err) {
        if (!mounted) return
        setComments([])
        setTotalPages(1)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [activeTab, currentPage])

  const onChangeTab = (next: string | number) => {
    const key = String(next) as Tab
    if (key === activeTab) return
    setActiveTab(key)
    setCurrentPage(1)
  }

  const empty = !loading && comments.length === 0

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          {/* 브레드크럼 */}
          <div className="mb-[32px] flex items-center space-x-[6px]">
            <span
              onClick={() => navigate('/mypage')}
              className="cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
            >
              마이페이지
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-[22px] h-[22px]"
            />
            <span
              onClick={() => navigate('/mypage')}
              className="cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
            >
              내 활동
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-[22px] h-[22px]"
            />
            <span className="text-title1-bold text-label-normal">
              내가 쓴 댓글
            </span>
          </div>

          {/* 탭 */}
          <TagChips
            // endpoint="/__ignore__"
            mode="single"
            includeAllItem={false}
            value={activeTab}
            onChange={onChangeTab}
            // fallbackTags={TAB_TAGS}
            className="ml-[20px] mb-6"
            gapPx={8}
          />

          {/* 댓글 목록 */}
          <section aria-live="polite" className="ml-[20px] mt-6">
            {loading ? (
              <div className="py-10 text-label-assistive">불러오는 중...</div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center no-result">
                <img
                  src="/icons/empty.svg"
                  alt="빈 댓글 목록"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-body-1sb text-label-normal">
                  아직 작성한 댓글이 없어요!
                </p>
              </div>
            ) : (
              comments.map((c) => {
                // cacheTick은 "캐시 채워진 뒤 재렌더" 트리거용
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _ = cacheTick

                const s = postCache.current.get(keyOf(c.type, c.postId))
                return (
                  <CommentRowCompact
                    key={c.commentId}
                    id={c.postId}
                    postId={c.postId} 
                    postType={c.type}
                    title={s?.title ?? '제목'}
                    content={c.content ?? ''}
                    createdAt={c.createdAt}
                    onClick={() =>
                      navigate(
                        c.type === 'QnA'
                          ? `/qna/${c.postId}`
                          : `/free/${c.postId}`
                      )
                    }
                  />
                )
              })
            )}
          </section>

          {/* 페이지네이션 */}
          <div className="ml-[20px] mt-8 mb-8 flex justify-center">
            <PaginationGroup
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              groupSize={5}
            />
          </div>
        </div>
      </main>
    </>
  )
}
