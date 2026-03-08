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
  tipId: number
  title: string
  contentPreview?: string
  writer: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
  profileImageUrl?: string | null
}

type FreeItem = {
  freeId: number
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

type AnyItem = TipItem | FreeItem | QnaItem

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

const TAB_TAGS = [
  { id: 'tip', name: '선배가 알려줘요' },
  { id: 'qna', name: '신입이 질문해요' },
  { id: 'free', name: '다같이 얘기해요' },
] as const

const toRow = (p: AnyItem): Row => {
  if ('tipId' in p) {
    return {
      id: p.tipId,
      title: p.title,
      content: p.contentPreview ?? '',
      writer: p.writer,
      createdAt: p.createdAt,
      tags: p.tags ?? [],
      imageUrl: p.imageUrl ?? null,
      profileImageUrl: p.profileImageUrl ?? null,
    }
  }

  if ('freeId' in p) {
    return {
      id: p.freeId,
      title: p.title,
      content: p.content ?? p.contentPreview ?? '',
      writer: p.writer,
      createdAt: p.createdAt,
      tags: p.tags ?? [],
      imageUrl: p.imageUrl ?? null,
      profileImageUrl: p.profileImageUrl ?? null,
    }
  }

  return {
    id: p.postId,
    title: p.title,
    content: p.content ?? p.contentPreview ?? '',
    writer: p.writer,
    createdAt: p.createdAt,
    tags: p.tags ?? [],
    imageUrl: p.imageUrl ?? null,
    profileImageUrl: p.profileImageUrl ?? null,
  }
}

export default function Bookmarked() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('tip')
  const [posts, setPosts] = useState<AnyItem[]>([])
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
        const url =
          activeTab === 'tip'
            ? `/api/mypage/tip-scraps?page=${pageParam}`
            : activeTab === 'free'
            ? `/api/mypage/free-scraps?page=${pageParam}`
            : `/api/qna-posts/scrap?page=${pageParam}`

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
            // endpoint="/__ignore__"
            mode="single"
            includeAllItem={false}
            value={activeTab}
            onChange={onChangeTab}
            // fallbackTags={TAB_TAGS as any}
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
              posts.map((raw, index) => {
                const row = toRow(raw)
                const isLast = index === posts.length - 1

                const detailPath = `/${activeTab}/${row.id}`

                return (
                  <Link
                    key={row.id}
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
                      previewLines={1}
                      borderColor={
                        isLast ? 'transparent' : 'var(--line-normal)'
                      }
                      className="bg-white"
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
