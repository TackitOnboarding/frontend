/**
 * PostRowCompact
 * - 게시글 목록에서 게시글 하나에 해당하는 리스트 아이템을 렌더링하는 재사용 컴포넌트
 * - Reply 아이콘(내가 쓴 댓글 목록에서 사용), 작성자/날짜/태그, 미리보기, 썸네일, 밀도(density) 등을 옵션으로 제어
 * - density=compact 인 경우 내부 메타(PostMeta)는 compact variant로 맞춰 렌더링됨
 */

import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PostMeta from './PostMeta'
import PostPreview from './PostPreview'

export type PostRowProps = {
  id?: number
  postType: string
  title: string
  content: string
  writer?: string
  createdAt?: string
  variant?: 'default' | 'compact'
  tags?: string[]
  imageUrl?: string | null
  profileImageUrl?: string | null
  className?: string
  borderColor?: string
  onClick?: () => void

  // 확장 플래그들
  showReplyIcon?: boolean
  hideWriter?: boolean
  showTags?: boolean
  showDate?: boolean
  previewLines?: number
  thumbnail?: 'auto' | 'none'
  density?: 'comfortable' | 'compact'
  isLast?: boolean
}

const ReplyIcon = ({ className = '' }: { className?: string }) => (
  <img
    src="/icons/icon-reply.svg"
    alt="reply icon"
    width={18}
    height={18}
    className={className}
    style={{ display: 'block' }}
  />
)

export default function PostRowCompact({
  id,
  postType,
  title,
  content,
  writer = '',
  createdAt = '',
  tags = [],
  imageUrl = null,
  profileImageUrl = null,
  className = '',
  borderColor = 'var(--line-normal)',
  onClick,

  showReplyIcon = false,
  hideWriter = false,
  showTags = true,
  showDate = true,
  previewLines = 2,
  thumbnail = 'auto',
  density = 'comfortable',
  isLast = false,
  variant = 'default',
}: PostRowProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (!id) return toast.error('잘못된 게시글 ID입니다.')
    
    // postType에 따른 경로 매핑 (BoardList 설정과 동기화)
    const pathMap: Record<string, string> = {
      TIP: 'tip',
      QNA: 'qna',
      FREE: 'free',
      NOTICE: 'notice',
      ACTIVITY: 'activity'
    }
    const boardPath = pathMap[postType] || 'free'
    navigate(`/board/${boardPath}/${id}`)
  }

  const containerPadding = density === 'compact' ? 12 : 16
  const gap = density === 'compact' ? 8 : 10
  const showThumb = thumbnail === 'auto' && !!imageUrl
  const effectiveVariant = density === 'compact' ? 'compact' : 'default'

  return (
    <article
      onClick={handleClick}
      className={`transition ${className ?? ''}`}
      style={{
        cursor: 'pointer',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        gap,
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {showReplyIcon && (
          <div style={{ color: 'var(--label-neutral)', marginTop: 4 }}>
            <ReplyIcon />
          </div>
        )}

        {/* 텍스트 영역 래퍼: 보더를 여기로 옮겨 아이콘 영역 제외 */}
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            borderBottom: isLast ? 'none' : `1px solid ${borderColor}`,
            paddingBottom: Math.max(0, containerPadding - 4),
          }}
        >
          <h3 className="text-title-2b text-label-normal" style={{ margin: 0 }}>
            {title ?? '(제목 없음)'}
          </h3>

          <PostPreview
            content={content}
            className="text-body-1 text-label-neutral"
            lines={previewLines}
          />

          {(showTags || !hideWriter || showDate) && (
            <PostMeta
              writer={hideWriter ? '' : writer}
              createdAt={showDate ? createdAt : ''}
              tags={tags}
              profileImageUrl={profileImageUrl ?? undefined}
              variant={effectiveVariant}
            />
          )}
        </div>

        {showThumb && (
          <div
            style={{
              width: 120,
              height: 80,
              flex: '0 0 120px',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <img
              src={imageUrl!}
              alt={title ?? '썸네일'}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>
    </article>
  )
}
