/**
 * 마이페이지 "내가 쓴 댓글" 목록에서 사용하는 컴팩트 Row 컴포넌트
 *
 * - 원글 제목 + 댓글 미리보기(PostPreview) 표시
 * - 작성자/날짜 메타(PostAuthorMeta) 표시 (옵션: 작성자 숨김, 날짜 숨김)
 * - 답글 아이콘 표시 옵션 지원
 */
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PostPreview from './PostPreview'
import PostAuthorMeta from './PostAuthorMeta'

export type CommentRowProps = {
  id?: number
  postId: number;
  postType: string
  title: string
  content: string
  writer?: string
  createdAt?: string
  imageUrl?: string | null
  className?: string
  borderColor?: string
  onClick?: () => void
  showReplyIcon?: boolean
  previewLines?: number

  // PostRowCompact와 유사한 확장 플래그
  hideWriter?: boolean
  showDate?: boolean
}

const ReplyIcon = ({ className = '' }) => (
  <img
    src="/icons/icon-reply.svg"
    alt="reply icon"
    width={18}
    height={18}
    className={className}
    style={{ display: 'block' }}
  />
)

export default function CommentRowCompact({
  id,
  postId,
  postType,
  title,
  content,
  writer = '',
  createdAt = '',
  imageUrl = null,
  className = '',
  borderColor = 'var(--line-normal)',
  onClick,
  showReplyIcon = true,
  previewLines = 1,
  hideWriter = false,
  showDate = true,
}: CommentRowProps) {
  const navigate = useNavigate()

  const handleClick = () => {
   if (!postId) return toast.error('게시글 정보를 찾을 수 없습니다.')
    const pathMap: Record<string, string> = {
      TIP: 'tip',
      QNA: 'qna',
      FREE: 'free',
      NOTICE: 'notice'
    }
    const boardPath = pathMap[postType] || 'free'
    navigate(`/board/${boardPath}/${postId}`)
  }

  // 닉네임 없으면 빈 문자열로 -> PostAuthorMeta가 날짜만 렌더링하도록
  const safeWriter = writer?.trim() ? writer : ''

  return (
    <article
      onClick={handleClick}
      className={`transition ${className}`}
      style={{
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* 1) 제목 */}
      <h3 className="m-0 text-title-2b text-label-normal">
        {title ?? '(제목 없음)'}
      </h3>

      {/* 2) 댓글 아이콘 + 작성자/날짜 */}
      <div className="flex items-start">
        {showReplyIcon && (
          <div className="text-label-assistive mr-[12px]">
            <ReplyIcon />
          </div>
        )}

        <div className="flex flex-col flex-1 gap-2">
          <PostAuthorMeta
            writer={hideWriter ? '' : safeWriter}
            createdAt={showDate ? createdAt : ''}
            profileImageUrl={imageUrl ?? undefined}
            variant="compact"
          />

          <PostPreview
            content={content}
            className="text-body1-reading-regular text-label-normal"
            lines={previewLines}
          />
        </div>
      </div>
    </article>
  )
}
