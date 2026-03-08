/**
 * 관리자 신고 현황 페이지
 * - 신고 접수/비활성화 상태별 신고 목록 조회
 * - 필터 및 페이지네이션으로 목록 관리
 * - 신고 상세 페이지로 이동 지원
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import TagChips from '../../components/TagChips'
import PaginationGroup from '../../components/Pagination'
import api from '../../api/api'
import './ReportListPage.css'

type TargetType = 'FREE_POST' | 'QNA_POST' | 'TIP_POST' | string
type RowStatus = 'ACTIVE' | 'DISABLED' | string

type RawReport = {
  reportId: number
  targetId: number
  targetType: TargetType
  title: string
  status: RowStatus
  reportCount: number
  lastReportedAt: string
}

type ViewReport = {
  reportId: number
  targetId: number
  targetType: TargetType
  boardLabel: '자유게시판' | '질문게시판' | '선임자의 TIP' | '댓글' | string
  title: string
  statusChip: { label: string; tone: 'neutral' | 'danger' | 'primary' }
  lastReportedDate: string
}

const PAGE_SIZE = 10

function boardLabelOf(t: TargetType): ViewReport['boardLabel'] {
  switch (t) {
    case 'FREE_POST':
      return '자유게시판'
    case 'QNA_POST':
      return '질문게시판'
    case 'TIP_POST':
      return '선임자의 TIP'
    default: {
      const upper = t.toUpperCase()
      if (upper.includes('COMMENT')) return '댓글'
      return t
    }
  }
}

function toView(r: RawReport): ViewReport {
  const statusChip =
    r.status === 'DISABLED'
      ? { label: '비활성화', tone: 'danger' as const }
      : { label: `신고 ${r.reportCount}회`, tone: 'neutral' as const }

  return {
    reportId: r.reportId,
    targetId: r.targetId,
    targetType: r.targetType,
    boardLabel: boardLabelOf(r.targetType),
    title: r.title,
    statusChip,
    lastReportedDate: r.lastReportedAt.slice(0, 10),
  }
}

type Filter = '전체' | '신고 접수' | '비활성화'
const filterToId = (f: Filter) => (f === '전체' ? 0 : f === '신고 접수' ? 1 : 2)

function StatusChip({
  label,
  tone,
}: {
  label: string
  tone: 'neutral' | 'danger' | 'primary'
}) {
  const toneClass =
    tone === 'danger'
      ? 'bg-[var(--background-red)] text-[var(--label-danger)]'
      : tone === 'primary'
      ? 'bg-[var(--background-blue)] text-[var(--label-primary)]'
      : 'bg-[var(--background-neutral)] text-[var(--label-normal)]'
  return (
    <span
      className={`inline-flex items-center justify-center px-[10px] py-[4px] rounded-md text-body-2 ${toneClass}`}
    >
      {label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="h-[52px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <td
          key={i}
          className={i === 0 ? 'pl-[24px]' : i === 3 ? 'pr-[24px]' : ''}
        >
          <div className="h-4 w-full max-w-[220px] rounded bg-[var(--background-neutral)] animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export default function AdminReportStatusPage() {
  const [filter, setFilter] = useState<Filter>('전체')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<ViewReport[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('accessToken')
        const res = await api.get<{
          page: number
          content: RawReport[]
          size: number
          totalElements: number
          totalPages: number
        }>('/api/admin/dashboard/reports', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          params: { page: page - 1, size: PAGE_SIZE, status: 'ALL' }, // 전체 요청
        })

        let src: RawReport[] = Array.isArray(res?.data?.content)
          ? res.data.content
          : []

        if (filter === '신고 접수') {
          src = src.filter((r) => r.status === 'ACTIVE')
        } else if (filter === '비활성화') {
          src = src.filter((r) => r.status === 'DISABLED')
        }

        if (mounted) {
          setItems(src.map(toView))
          setTotalPages(res?.data?.totalPages ?? 1)
        }
      } catch {
        if (mounted) {
          setItems([]) // fallback 제거 → 빈 배열 반환
          setTotalPages(1)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [filter, page])

  useEffect(() => {
    setPage(1)
  }, [filter])

  return (
    <AdminLayout>
      <div className="ml-[36px] mt-[32px]">
        <h1 className="text-[var(--label-normal)] font-bold text-[24px] mb-[20px]">
          신고 접수 현황
        </h1>

        {/* 탭 */}
        <div className="mb-[16px] user-management-page">
          <TagChips
            includeAllItem={false}
            value={filterToId(filter)}
            // fallbackTags={[
            //   { id: 0, name: '전체' },
            //   { id: 1, name: '신고 접수' },
            //   { id: 2, name: '비활성화' },
            // ]}
            onChange={(v) => {
              if (v === 0) setFilter('전체')
              else if (v === 1) setFilter('신고 접수')
              else setFilter('비활성화')
            }}
            gapPx={10}
          />
        </div>

        {/* 카드 + 표 */}
        <div className="bg-white w-[1086px] rounded-2xl ring-1 ring-[var(--line-normal)] overflow-hidden">
          <div className="pt-[24px] pb-[12px] px-[24px]">
            <div className="overflow-hidden rounded-xl">
              <table className="w-full table-fixed border-collapse text-[15px]">
                <thead className="bg-[var(--background-neutral)] text-left text-[var(--label-neutral)] text-body-2">
                  <tr className="h-[48px]">
                    <th className="pl-[24px] w-[20%] font-medium align-middle">
                      유형
                    </th>
                    <th className="w-[46%] font-medium align-middle">
                      신고 내용
                    </th>
                    <th className="w-[16%] font-medium align-middle">상태</th>
                    <th className="pr-[24px] w-[18%] font-medium align-middle text-left">
                      신고 일자
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading &&
                    Array.from({ length: 5 }).map((_, idx) => (
                      <SkeletonRow key={idx} />
                    ))}

                  {!loading &&
                    items.map((r, i) => {
                      // ✅ 상세 페이지 경로: /admin/reports/:targetType/:targetId
                      const detailHref = `/admin/reports/${r.targetType}/${r.targetId}`

                      return (
                        <tr
                          key={r.reportId}
                          className={`border-t border-[var(--line-normal)] h-[52px] text-body-1 transition-colors ${
                            i % 2 === 1
                              ? 'bg-[var(--background-subtle,transparent)]'
                              : ''
                          } hover:bg-[var(--background-neutral)]/60`}
                        >
                          {/* 유형 */}
                          <td className="pl-[24px] text-[var(--label-normal)] align-middle">
                            {r.boardLabel}
                          </td>

                          {/* 신고 내용 + 외부 이동 아이콘 */}
                          <td className="text-[var(--label-normal)] align-middle">
                            <div className="inline-flex items-center gap-[6px]">
                              <span
                                className="truncate block max-w-[540px]"
                                title={r.title}
                              >
                                {r.title}
                              </span>

                              {detailHref ? (
                                <Link to={detailHref} aria-label="상세로 이동">
                                  <img
                                    src="/icons/external-link.svg"
                                    alt=""
                                    width={14}
                                    height={14}
                                    aria-hidden="true"
                                    className="cursor-pointer hover:opacity-70"
                                  />
                                </Link>
                              ) : (
                                <img
                                  src="/icons/external-link.svg"
                                  alt=""
                                  width={14}
                                  height={14}
                                  aria-hidden="true"
                                  className="opacity-40"
                                  title="상세 이동을 위해 targetId가 필요합니다."
                                />
                              )}
                            </div>
                          </td>

                          {/* 상태(칩) */}
                          <td className="align-middle">
                            <StatusChip
                              label={r.statusChip.label}
                              tone={r.statusChip.tone}
                            />
                          </td>

                          {/* 신고 일자 */}
                          <td className="pr-[24px] text-[var(--label-normal)] align-middle">
                            {r.lastReportedDate}
                          </td>
                        </tr>
                      )
                    })}

                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="h-[96px]">
                        <div className="h-full w-full flex items-center justify-center gap-2 text-[var(--label-neutral)]">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M4 7h16M4 12h10M4 17h16"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                          데이터가 없습니다.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              <div className="flex justify-center mt-[12px] mb-[4px]">
                <PaginationGroup
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
