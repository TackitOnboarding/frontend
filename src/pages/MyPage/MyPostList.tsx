import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import TagChips from '../../components/TagChips'
import { Link } from 'react-router-dom'
import PostCard from '../../components/posts/PostCard'
import PaginationGroup from '../../components/Pagination'
import api from '../../api/api'
import './MyPageContainer.css'

type Tab = 'tip' | 'qna' | 'free'

type TipItem = {
  id: number
  title: string
  contentPreview?: string
  writer: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
  profileImageUrl?: string | null
}

type FreeItem = {
  id: number
  title: string
  content?: string
  contentPreview?: string
  writer: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
  profileImageUrl?: string | null
}

type QnaItem = {
  postId: number
  title: string
  content?: string
  contentPreview?: string
  writer: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
  profileImageUrl?: string | null
}

type Row = {
  id: number
  title: string
  content: string
  writer: string
  createdAt: string
  tags: string[]
  imageUrl: string | null
  profileImageUrl?: string | null
}

const TAB_TAGS: Array<{ id: Tab; name: string }> = [
  { id: 'tip', name: '선배가 알려줘요' },
  { id: 'qna', name: '신입이 질문해요' },
  { id: 'free', name: '다같이 얘기해요' },
]

export default function MyPostList() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('tip')
  const [posts, setPosts] = useState<Array<TipItem | FreeItem | QnaItem>>([])
  const [currentPage, setCurrentPage] = useState(1) // 1-base
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)

        const token = localStorage.getItem('accessToken')
        const pageParam = currentPage - 1
        const size = 3
        const sortOrder = 'desc'

        const endpoint =
          activeTab === 'tip'
            ? `/api/mypage/tip-posts`
            : activeTab === 'free'
            ? `/api/mypage/free-posts`
            : `/api/mypage/qna-posts`

        const res = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pageParam,
            size,
            sort: `createdAt,${sortOrder}`,
          },
        })

        if (!mounted) return

        setPosts(res.data?.content ?? [])
        setTotalPages(res.data?.totalPages ?? 1)
      } catch (err) {
        if (!mounted) return
        setPosts([])
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

  const toDetailPath = (tab: Tab, id: number) => {
    if (tab === 'tip') return `/tip/${id}`
    if (tab === 'free') return `/free/${id}`
    return `/qna/${id}`
  }

  const mapToRow = (tab: Tab, p: TipItem | FreeItem | QnaItem): Row => {
    if (tab === 'tip') {
      const t = p as TipItem
      return {
        id: t.id,
        title: t.title,
        content: t.contentPreview ?? '',
        writer: t.writer,
        createdAt: t.createdAt,
        tags: t.tags ?? [],
        imageUrl: t.imageUrl ?? null,
        profileImageUrl: t.profileImageUrl ?? null,
      }
    }

    if (tab === 'free') {
      const f = p as FreeItem
      return {
        id: f.id,
        title: f.title,
        content: f.content ?? f.contentPreview ?? '',
        writer: f.writer,
        createdAt: f.createdAt,
        tags: f.tags ?? [],
        imageUrl: f.imageUrl ?? null,
        profileImageUrl: f.profileImageUrl ?? null,
      }
    }

    const q = p as QnaItem
    return {
      id: q.postId,
      title: q.title,
      content: q.content ?? q.contentPreview ?? '',
      writer: q.writer,
      createdAt: q.createdAt,
      tags: q.tags ?? [],
      imageUrl: q.imageUrl ?? null,
      profileImageUrl: q.profileImageUrl ?? null,
    }
  }

  const empty = !loading && posts.length === 0

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          {/* 브레드크럼 */}
          <div className="mb-[32px] flex items-center space-x-[6px]">
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
            >
              마이페이지
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-5.5 h-5.5 text-label-assistive"
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
            <span className="text-title1-bold text-label-normal">
              내가 쓴 글
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

          {/* 리스트 */}
          <section aria-live="polite" className="ml-[20px] mt-6">
            {loading ? (
              <div className="py-10 text-label-assistive">불러오는 중...</div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center no-result">
                <img
                  src="/icons/empty.svg"
                  alt="빈 게시판"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-body-1sb text-label-normal">
                  아직 작성한 글이 없어요!
                </p>
              </div>
            ) : (
              posts.map((raw, idx) => {
                const row = mapToRow(activeTab, raw)
                const isLast = idx === posts.length - 1
                const detailPath = toDetailPath(activeTab, row.id)

                return (
                  <Link
                    key={`${activeTab}-${row.id}-${idx}`}
                    to={detailPath}
                    className="block"
                    style={{ textDecoration: 'none' }}
                  >
                    <PostCard
                      id={row.id}
                      title={row.title}
                      content={row.content}
                      writer={row.writer}
                      createdAt={row.createdAt}
                      tags={row.tags}
                      imageUrl={row.imageUrl}
                      profileImageUrl={
                        row.profileImageUrl ?? '/icons/mypage-icon.svg'
                      }
                      previewLines={1} // 1줄
                      borderColor={
                        isLast ? 'transparent' : 'var(--line-normal)'
                      } // 마지막 보더 제거
                      className="bg-white"
                    />
                  </Link>
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
