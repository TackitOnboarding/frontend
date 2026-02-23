/**
 * 인기 게시글 랭킹 카드 컴포넌트
 *
 * - 제목 1줄, 본문 2줄 요약 표시
 * - 랭킹 순위 및 작성자 메타 정보 표시
 */

import PostAuthorMeta from './PostAuthorMeta'
import { useNavigate } from 'react-router-dom'

type PostType = 'FREE_POST' | 'QNA_POST' | 'TIP_POST' | string

export type PopularPost = {
  id: number
  writer: string
  profileImageUrl?: string | null
  title: string
  content: string
  createdAt: string
  type: PostType
  viewCount?: number | null
  scrapCount?: number | null
}

const TYPE_BADGE: Record<PostType, { label: string }> = {
  FREE_POST: { label: '다같이 얘기해요' },
  QNA_POST: { label: '신입이 질문해요' },
  TIP_POST: { label: '선배가 알려줘요' },
}

const typeToPath = (t: PostType) => {
  if (t === 'FREE_POST') return '/free'
  if (t === 'QNA_POST') return '/qna'
  if (t === 'TIP_POST') return '/tip'
  return '/free'
}

export default function PopularPostCard({
  post,
  rank,
  className,
}: {
  post: PopularPost
  rank: number
  className?: string
}) {
  const navigate = useNavigate()
  const badge = TYPE_BADGE[post.type] ?? { label: '자유롭게 얘기해요' }
  const content = (post.content ?? '').replace(/\r\n/g, '\n')
  const contentLines = content.split('\n')

  const handleClick = () => {
    const boardPath = typeToPath(post.type)
    navigate(`${boardPath}/${post.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={[
        'relative block cursor-pointer rounded-[12px] border border-[var(--line-normal)]',
        'bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow',
        'w-[350px] h-[229.06px] px-[24px] py-[32px]',
        className ?? '',
      ].join(' ')}
    >
      {/* 우측 상단 랭크 태그 */}
      <div
        className="
          absolute top-0 right-0 h-[32px] px-[12px]
          bg-[var(--color-primary-500)] text-[var(--label-inverse)]
          text-body-1sb
          rounded-bl-[12px] rounded-tr-[12px]
          flex items-center justify-center
        "
      >
        {rank}
      </div>

      {/* 상단 타입 배지 */}
      <div
        className="
          inline-flex items-center
          rounded-[8px] px-[8px] py-[4px]
          bg-[var(--background-active)] text-[var(--label-inverse)]
          text-body-2
          mb-[12px]
        "
      >
        {badge.label}
      </div>

      {/* 제목 */}
      <h3
        className="
          text-[var(--label-normal)] text-title-2b
          leading-[1.2] mb-[8px]
        "
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
          overflow: 'hidden',
        }}
        title={post.title}
      >
        {post.title}
      </h3>

      {/* 본문 요약 */}
      <p
        className="
    text-body-1 text-[var(--label-neutral)] mb-[12px]
    overflow-hidden
    [display:-webkit-box]
    [-webkit-box-orient:vertical]
    [-webkit-line-clamp:2]
    leading-[1.5]
    min-h-[3em]
  "
        title={content}
      >
        {contentLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < contentLines.length - 1 && <br />}
          </span>
        ))}
      </p>

      {/* 작성자/날짜 */}
      <PostAuthorMeta
        writer={post.writer}
        createdAt={post.createdAt}
        profileImageUrl={post.profileImageUrl ?? undefined}
        variant="compact"
      />
    </div>
  )
}
