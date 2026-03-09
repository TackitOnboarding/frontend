import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import TagChips from '../../components/TagChips'
import { Link } from 'react-router-dom'
import PostCard from '../../components/posts/PostCard'
import PaginationGroup from '../../components/Pagination'
import api from '../../api/api'
import './MyPageContainer.css'

type Tab = 'TIP' | 'QNA' | 'FREE'

const DETAIL_PATH_MAP: Record<Tab, string> = {
  TIP: 'tip',   // BoardSection의 config.detailPath와 일치해야 함
  QNA: 'qna',
  FREE: 'free'
};


export default function Bookmarked() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('TIP')
  const [posts, setPosts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1) // 1-base
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const pageParam = currentPage - 1 // 서버 0-base
        const url = `/api/posts/scraps?postType=${activeTab}&page=${pageParam}`

        const res = await api.get(url)
        if (!mounted) return

        setPosts(res.data.content ?? [])
        setTotalPages(res.data.totalPages ?? 1)
      } catch {
        if (!mounted) return
        setPosts([])
        setTotalPages(1)
        setError('스크랩 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
      } finally {
        if (!mounted) return
        setLoading(false)
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

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          {/* 브레드크럼  : 마이페이지 > 내 활동 > 스크랩 */}
          <div className="mb-[32px] flex items-center space-x-[6px]">
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
              style={{ textDecoration: 'none' }}
            >
              마이페이지
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-[24px] h-[24px]  text-label-assistive"
            />
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
              style={{ textDecoration: 'none' }}
            >
              내 활동
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-5.5 h-5.5 text-label-assistive"
            />
            <span className="text-title1-bold text-label-normal">스크랩</span>
          </div>

          <TagChips
            mode="single"
            includeAllItem={false}
            value={activeTab}
            onChange={onChangeTab}
            className="ml-[20px] mb-6"
            gapPx={8}
          />

          <section aria-live="polite" className="ml-[20px] mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-body-1sb text-label-normal">불러오는 중…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center no-result">
                <img
                  src="/icons/empty.svg"
                  alt="오류"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-body-1sb text-label-normal">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center no-result">
                <img
                  src="/icons/empty.svg"
                  alt="빈 게시판"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-body-1sb text-label-normal">
                  아직 스크랩한 글이 없어요!
                </p>
              </div>
            ) : (
              posts.map((post, index) => {
                const detailPath = DETAIL_PATH_MAP[activeTab];
                return (
                  <Link
                    key={post.postId}
                    to={`/board/${detailPath}/${post.postId}`}
                    className="block"
                  >
                    <PostCard
                      id={post.postId}
                      title={post.title}
                      content={post.contentPreview || post.content}
                      writer={post.writer}
                      createdAt={post.createdAt}
                      tags={post.tags || []}
                      imageUrl={post.imageUrl || null}
                      profileImageUrl={post.profileImageUrl || '/icons/mypage-icon.svg'}
                      previewLines={1}
                      borderColor={index === posts.length - 1 ? 'transparent' : 'var(--line-normal)'}
                    />
                  </Link>
                )
              })
            )}
          </section>

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
