import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../../components/posts/PostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import { sanitizeHtml } from '../../utils/sanitize'
import { hydrateCoverToken } from '../../utils/coverToken'
import CommentList from '../../components/comments/CommentList'
import CommentEditor from '../../components/comments/CommentEditor'
import type { CommentModel } from '../../components/comments/CommentItem'
import ReportModal from '../../components/modals/ReportModal'
import {
  toastSuccess,
  toastWarn,
  toastError,
  toastInfo,
} from '../../utils/toast'
import PostHeader from '../../components/posts/PostHeader'

type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags?: string[]
  createdAt: string
  imageUrl: string | null
  isScrap?: boolean
  isMine: boolean
  profileImageUrl?: string | null
}

function BoardDetail() {
  const { boardType, id } = useParams<{boardType: string; id: string }>()
  const navigate = useNavigate()
  const activeMemberId = localStorage.getItem('activeProfileId')


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
  const normalizeComments = useCallback((raw: any[]): CommentModel[] => {
    return (raw ?? []).map((c: any) => ({
      id: c.id,
      writer: c.writer?.nickname ?? '익명', // 익명일 경우 writer가 null로 옴
      content: c.content,
      createdAt: c.createdAt,
      profileImageUrl: c.writer?.profileImageUrl ?? null,
      isMine: !!c.isMine,
      isDeleted: !!c.isDeleted,
      children: c.children ? normalizeComments(c.children) : [] // 재귀적 자식 댓글 처리
    }))
  }, [])

  // 게시글 및 댓글 통합 로딩 함수
  const fetchPostData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await api.get(`/api/posts/${id}`, {
        headers: { 'Active-Member-Id': activeMemberId }
      })
      
      const { post: item, comments: rawComments } = res.data.content

      const normalizedPost: Post = {
        id: item.id,
        writer: item.writer?.nickname ?? '익명',
        title: item.title,
        content: item.content,
        createdAt: item.createdAt,
        imageUrl: item.profileImageUrl ?? null,
        isScrap: !!item.scrap || !!item.isScrap, // 명세서 혼용 대응
        isMine: !!item.mine || !!item.isMine,
        profileImageUrl: item.writer?.profileImageUrl ?? null,
      }

      setPost(normalizedPost)
      setComments(normalizeComments(rawComments))
    } catch (err) {
      toastError('게시글 정보를 불러오지 못했습니다.')
      navigate('/board')
    } finally {
      setLoading(false)
    }
  }, [id, activeMemberId, navigate, normalizeComments])

  useEffect(() => {
    fetchPostData()
  }, [fetchPostData])

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!window.confirm('이 글을 삭제하시겠습니까?')) return
    try {
      await api.delete(`/api/posts/${id}`, {
        headers: { 'Active-Profile-Id': activeMemberId }
      })
      toastSuccess('게시글 삭제 성공')
      navigate('/board')
    } catch {
      toastError('삭제에 실패했습니다.')
    }
  }

  // 스크랩 토글
  const handleScrapToggle = async () => {
    if (!post) return
    try {
      await api.post(`/api/posts/${id}/scrap`, {}, {
        headers: { 'Active-Member-Id': activeMemberId }
      })
      const nextScrap = !post.isScrap
      setPost({ ...post, isScrap: nextScrap })
      toastSuccess(nextScrap ? '게시글 스크랩 추가 성공' : '게시글 스크랩 취소 성공')
    } catch {
      toastError('스크랩 처리에 실패했습니다.')
    }
  }

  const handleCommentSubmit = async (content: string, parentId?: number) => {
    if (!content.trim()) return toastWarn('댓글을 입력해주세요.')
    try {
      await api.post(`/api/posts/${id}/comments`, {
        parentCommentId: parentId ?? null,
        content: content.trim()
      }, {
        headers: { 'Active-Member-Id': activeMemberId }
      })
      toastSuccess('댓글 작성 성공')
      setCommentInput('')
      fetchPostData() // 목록 새로고침
    } catch {
      toastError('댓글 등록에 실패했습니다.')
    }
  }

  // 게시글 신고
  // const handlePostReport = async (p: ReportPayload) => {
  //   try {
  //     await api.post(`/api/reports/create`, { targetId: postIdNumber, targetType: config.reportType, reason: p.reason })
  //     const res = await api.post(config.reportApi(id!))
  //     toastInfo(typeof res.data === 'string' ? res.data : res.data?.message || '신고가 접수되었습니다.')
  //     setShowPostReportModal(false)
  //   } catch {
  //     toastError('신고 처리에 실패했습니다.')
  //   }
  // }

  // 댓글 수정
  const handleSaveEditComment = async ({ id: cid, content }: { id: number; content: string }) => {
    try {
      await api.patch(`/api/comments/${cid}`, {
        content: content.trim()
      }, {
        headers: { 'Active-Member-Id': activeMemberId }
      })
      toastSuccess('댓글 수정 성공')
      setEditCommentId(null)
      fetchPostData()
    } catch {
      toastError('댓글 수정에 실패했습니다.')
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (cid: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return
    try {
      await api.delete(`/api/comments/${cid}`, {
        headers: { 'Active-Member-Id': activeMemberId }
      })
      toastSuccess('댓글 삭제 성공')
      fetchPostData()
    } catch {
      toastError('삭제에 실패했습니다.')
    }
  }

  // 댓글 신고
  const handleSubmitCommentReport = async (cid: number) => {
    try {
      await api.post(`/api/comments/${cid}/report`, {}, {
        headers: { 'Active-Member-Id': activeMemberId }
      })
      toastInfo('댓글을 신고하였습니다.')
      setShowCommentReportModal(false)
    } catch {
      toastError('신고 처리에 실패했습니다.')
    }
  }

  if (loading) return (
    <><HomeBar /><div className="post-detail-container">불러오는 중...</div></>
  )

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
            isAuthor={post.isMine}
            onEdit={() => navigate(`/board/edit/${boardType}/${id}`)}
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

          <div className="flow-root pb-0 mt-0">
            <CommentList
              comments={comments}
              editCommentId={editCommentId}
              onEdit={handleSaveEditComment}
              onBeginEdit={(id) => setEditCommentId(id)}
              onCancelEdit={() => setEditCommentId(null)}
              onDelete={handleDeleteComment}
              onReport={(cid) => { 
                setReportingCommentId(cid); 
                setShowCommentReportModal(true); 
              }}
            />
            {!editCommentId && (
              <CommentEditor
                value={commentInput}
                onChange={setCommentInput}
                onSubmit={() => handleCommentSubmit(commentInput)}
                isEditing={false} />
            )}
          </div>
        </div>
      </div>

      {/* 게시글 신고 모달 */}
      {showPostReportModal && (
        <ReportModal
          isOpen={showPostReportModal}
          targetId={Number(id)}
          targetType="POST"
          onClose={() => setShowPostReportModal(false)}
          onSubmit={() => { /* 신고 API 연동 */ }}
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
          onSubmit={() => handleSubmitCommentReport(reportingCommentId)}
        />
      )}
    </>
  )

}

export default BoardDetail;