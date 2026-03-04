import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../../components/posts/PostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import { sanitizeHtml } from '../../utils/sanitize'
import { hydrateCoverToken } from '../../utils/coverToken'
import CommentList from '../../components/comments/CommentList'
import CommentEditor from '../../components/comments/CommentEditor'
import type { CommentModel } from '../../components/comments/CommentItem'
import ReportModal from '../../components/modals/ReportModal'
import type { ReportPayload } from '../../components/modals/ReportModal'
import {
  toastSuccess,
  toastWarn,
  toastError,
  toastInfo,
} from '../../utils/toast'
import PostHeader from '../../components/posts/PostHeader'

type BoardType = 'tip' | 'qna' | 'free' | 'notice'

type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl: string | null
  scrap?: boolean
  profileImageUrl?: string | null
}

interface BoardConfig {
  name: string;
  postApi: (id: string) => string;
  commentApi: ((id: string) => string) | null;
  commentBaseUrl: string | null;
  commentCreateApi: string | null;
  commentReportType: string | null;
  scrapApi: (id: string) => string;
  reportType: string;
  reportApi: (id: string) => string;
}


// 게시판별 설정 데이터 통합
const BOARD_CONFIG: Record<BoardType, BoardConfig> ={
  tip: {
    name: '선임자의 TIP',
    postApi: (id: string) => `/api/tip-posts/${id}`,
    commentApi: (id: string) => `/api/tip-comments/${id}`,
    commentBaseUrl: '/api/tip-comments',
    commentCreateApi: '/api/tip-comments',
    commentReportType: 'TIP_COMMENT',
    scrapApi: (id: string) => `/api/tip-posts/${id}/scrap`,
    reportType: 'TIP_POST',
    reportApi: (id: string) => `/api/tip-posts/${id}/report`,
  },
  qna: {
    name: '질문 게시판',
    postApi: (id: string) => `/api/qna-posts/${id}`,
    commentApi: (id: string) => `/api/qna-comment/${id}`,
    commentBaseUrl: '/api/qna-comment',
    commentCreateApi: '/api/qna-comment/create',
    commentReportType: 'QNA_COMMENT',
    scrapApi: (id: string) => `/api/qna-posts/${id}/scrap`,
    reportType: 'QNA_POST',
    reportApi: (id: string) => `/api/qna-posts/${id}/report`,
  },
  free: {
    name: '자유 게시판',
    postApi: (id: string) => `/api/free-posts/${id}`,
    commentApi: (id: string) => `/api/free-comments/${id}`,
    commentBaseUrl: '/api/free-comments',
    commentCreateApi: '/api/free-comments',
    commentReportType: 'FREE_COMMENT',
    scrapApi: (id: string) => `/api/free-posts/${id}/scrap`,
    reportType: 'FREE_POST',
    reportApi: (id: string) => `/api/free-posts/${id}/report`,
  },
  notice: {
    name: '공지 게시판',
    postApi: (id: string) => `/api/notice-posts/${id}`,
    commentApi: (id: string) => `/api/notice-comments/${id}`,
    commentBaseUrl: '/api/notice-comments',
    commentCreateApi: '/api/notice-comments',
    commentReportType: 'NOTICE_COMMENT',
    scrapApi: (id: string) => `/api/notice-posts/${id}/scrap`,
    reportType: 'NOTICE_POST',
    reportApi: (id: string) => `/api/notice-posts/${id}/report`,
  },
}

function BoardDetail() {
  const { boardType, id } = useParams<{boardType: string; id: string }>()
  const navigate = useNavigate()
  const { userInfo } = useFetchUserInfo()

  const type = (boardType?.toLowerCase() as BoardType) || 'free'
  const config = BOARD_CONFIG[type]
  const postIdNumber = Number(id)

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<CommentModel[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [isScrapped, setIsScrapped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  
  const [showPostReportModal, setShowPostReportModal] = useState(false)
  const [showCommentReportModal, setShowCommentReportModal] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null)

  // 데이터 정규화 함수들
  const normalizeComments = (raw: any): CommentModel[] => {
    const data = Array.isArray(raw?.content) ? raw.content : Array.isArray(raw) ? raw : raw ? [raw] : []
    return data.map((c: any) => ({
      id: Number(c.id),
      writer: String(c.writer ?? c.author ?? '(알 수 없음)'),
      content: String(c.content ?? ''),
      createdAt: String(c.createdAt ?? new Date().toISOString()),
      profileImageUrl: c.profileImageUrl ?? null,
      role: c.role,
      joinedYear: c.joinedYear ? Number(c.joinedYear) : undefined,
    })).filter((c: CommentModel) => Number.isFinite(c.id))
  }

  // 게시글 로딩
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await api.get(config.postApi(id!))
        const item = Array.isArray(res.data?.content) ? res.data.content[0] : res.data
        
        if (!item) {
          toastError('게시글을 찾지 못했습니다.')
          return
        }

        const normalized: Post = {
          id: Number(item.id ?? item.postId ?? id),
          writer: item.writer ?? '(알 수 없음)',
          title: item.title ?? '',
          content: item.content ?? '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: item.createdAt,
          imageUrl: item.imageUrl ?? null,
          scrap: !!item.scrap,
          profileImageUrl: item.profileImageUrl ?? null,
        }

        setPost(normalized)
        setIsScrapped(!!normalized.scrap)
      } catch {
        toastError('게시글 정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    if (id ) fetchPost()
  }, [id, config])

  // 댓글 로딩
  useEffect(() => {
    if (config.commentApi && id ) {
      api.get(config.commentApi(id))
        .then(res => setComments(normalizeComments(res.data)))
        .catch(() => setComments([]))
    }
  }, [id, config])

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!window.confirm('이 글을 삭제하시겠습니까?')) return
    try {
      await api.delete(config.postApi(id!))
      toastSuccess('게시글이 삭제되었습니다.')
      navigate('/board')
    } catch {
      toastError('삭제에 실패했습니다.')
    }
  }

  // 찜 토글
  const handleScrapToggle = async () => {
    const next = !isScrapped
    setIsScrapped(next)
    try {
      await api.post(config.scrapApi(id!))
      if (next) toastSuccess('게시물이 스크랩되었습니다.')
    } catch {
      setIsScrapped(!next)
      toastError('찜 처리에 실패했습니다.')
    }
  }

  // 게시글 신고
  const handlePostReport = async (p: ReportPayload) => {
    try {
      await api.post(`/api/reports/create`, { targetId: postIdNumber, targetType: config.reportType, reason: p.reason })
      const res = await api.post(config.reportApi(id!))
      toastInfo(typeof res.data === 'string' ? res.data : res.data?.message || '신고가 접수되었습니다.')
      setShowPostReportModal(false)
    } catch {
      toastError('신고 처리에 실패했습니다.')
    }
  }

  // 댓글 등록
  const handleCommentSubmit = async () => {
  const trimmed = commentInput.trim();
  if (!trimmed) return toastWarn('댓글을 입력해주세요.');

  try {
    const payload: any = { content: trimmed };

    if (type === 'tip') {
      payload.tipPostId = String(postIdNumber); 
    } else if (type === 'qna') {
      payload.qnaPostId = postIdNumber; 
    } else if (type === 'free') {
      payload.freePostId = postIdNumber; 
    } else if (type === 'notice') {
      payload.noticePostId = String(postIdNumber); 
    }

    const res = await api.post(config.commentCreateApi!, payload);

    const rawData = res.data;
    const [normalized] = normalizeComments(Array.isArray(rawData) ? rawData : [rawData]);

    if (normalized) {
      setComments(prev => [...prev, normalized]);
      setCommentInput('');
      toastSuccess('댓글이 등록되었습니다.');
    }
  } catch (err) {
    console.error('댓글 등록 에러:', err);
    toastError('댓글 등록 중 서버 오류가 발생했습니다.');
  }
};

  // 댓글 수정 핸들러
  const handleSaveEditComment = async ({ id, content }: { id: number; content: string }) => {
    if (!config.commentBaseUrl) return;
    const trimmed = content.trim()
    if (!trimmed) return toastWarn('댓글을 입력해주세요.')
    try {
      const res = await api.patch(`${config.commentBaseUrl}/${id}`, { content: trimmed })
      const [updated] = normalizeComments(res.data)
      setComments(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
      toastSuccess('댓글이 수정되었습니다.')
      setEditCommentId(null)
    } catch { toastError('댓글 수정에 실패했습니다.') }
  }

  // 댓글 신고
  const handleSubmitCommentReport = async (p: ReportPayload) => {
    if (!config.commentBaseUrl || !config.commentReportType) return;
    try {
      await api.post('/api/reports/create', { targetId: p.targetId, targetType: config.commentReportType, reason: p.reason })
      await api.post(`${config.commentBaseUrl}/${p.targetId}/report`)
      toastSuccess('신고처리가 완료되었습니다.')
      setShowCommentReportModal(false)
    } catch { toastError('댓글 신고 처리에 실패했습니다.') }
  }



  if (loading) return (
    <><HomeBar /><div className="post-detail-container"><h1 className="board-title">{config.name}</h1><div className="post-box">불러오는 중...</div></div></>
  )

  const isAuthor = !!(userInfo?.nickname && post && post.writer === userInfo.nickname)

  return (
    <>
      <HomeBar />
      <div className="post-detail-container">
        <img
          src="/assets/icons/arrow-left.svg"
          alt="뒤로가기"
          onClick={() => navigate('/board')}
          className="w-6 h-6 transition cursor-pointer hover:opacity-70"
        />

        {post && (
          <PostHeader
            title={post.title}
            writer={post.writer}
            createdAt={post.createdAt}
            profileImageUrl={post.profileImageUrl}
            isBookmarked={isScrapped}
            onToggleBookmark={handleScrapToggle}
            isAuthor={isAuthor}
            onEdit={() => navigate(`/board/edit/${type}/${id}`)}
            onDelete={handleDeletePost}
            onReport={() => setShowPostReportModal(true)}
          />
        )}

        <div className="mt-12">
          <div className="post-box">
            {post && (
              <>
                <div className="prose detail-content max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        hydrateCoverToken(
                          String(post.content ?? ''),
                          post.imageUrl
                        )
                      ),
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {config.commentApi && (
            <div className="flow-root pb-0 mt-0">
              <CommentList
                comments={comments}
                currentUserNickname={userInfo?.nickname}
                editCommentId={editCommentId}
                onEdit={handleSaveEditComment}
                onBeginEdit={(id) => setEditCommentId(id)}
                onCancelEdit={() => setEditCommentId(null)}
                onDelete={async (cid) => {
                  if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
                  try {
                    if (config.commentBaseUrl) {
                      await api.delete(`${config.commentBaseUrl}/${cid}`);
                      setComments(prev => prev.filter(c => c.id !== cid));
                      toastSuccess('댓글이 삭제되었습니다.');
                    }
                  } catch {
                    toastError('댓글 삭제에 실패했습니다.');
                  }
                }}
                onReport={(cid) => { 
                  setReportingCommentId(cid); 
                  setShowCommentReportModal(true); 
                }}
              />
              {!editCommentId && (
                <CommentEditor value={commentInput} onChange={setCommentInput} onSubmit={handleCommentSubmit} isEditing={false} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 게시글 신고 모달 */}
      {showPostReportModal && (
        <ReportModal
          isOpen={showPostReportModal}
          targetId={postIdNumber}
          targetType="POST"
          onClose={() => setShowPostReportModal(false)}
          onSubmit={handlePostReport}
        />
      )}

      {/* 댓글 신고 모달 */}
      {showCommentReportModal && reportingCommentId && (
        <ReportModal
          isOpen={showCommentReportModal}
          targetId={reportingCommentId!}
          targetType="COMMENT"
          onClose={() => {
            setShowCommentReportModal(false)
            setReportingCommentId(null)
          }}
          onSubmit={handleSubmitCommentReport}
        />
      )}

      {showCommentReportModal && reportingCommentId && (
        <ReportModal
          isOpen={showCommentReportModal}
          targetId={reportingCommentId}
          targetType="COMMENT"
          onClose={() => { setShowCommentReportModal(false); setReportingCommentId(null); }}
          onSubmit={handleSubmitCommentReport}
        />
      )}

    </>
  )

}

export default BoardDetail;