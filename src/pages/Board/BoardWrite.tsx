import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import './BoardWrite.css'
import { useNavigate, useParams } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import 'react-toastify/dist/ReactToastify.css'
import RichTextEditor, {
  type RichTextEditorHandle,
} from '../../components/editor/RichTextEditor'
import { toastWarn, toastError, toastSuccess } from '../../utils/toast'
import { PostCreateReq, PostCreateRes } from '../../types/post'
import { replaceFirstDataUrlImgWithToken } from '../../utils/coverToken'
import LeaveModal from '../../components/modals/LeaveModal'

type Tag = { id: number; tagName: string }

// 게시판별 설정 데이터
const BOARD_CONFIG = {
  tip: {
    tagApi: '/api/tip-tags/list',
    postApi: '/api/tip-posts',
    placeholder: '후배가 더 빨리 적응할 수 있도록 경험을 나눠주세요.',
    dtoKey: 'dto', // Tip 게시판은 dto 사용
  },
  qna: {
    tagApi: '/api/qna-tags/list',
    postApi: '/api/qna-posts',
    placeholder: '궁금한 점을 자유롭게 질문해 주세요.',
    dtoKey: 'request', // Qna 게시판은 request 사용
  },
  free: {
    tagApi: '/api/free_tags',
    postApi: '/api/free-posts',
    placeholder: '자유롭게 작성해 주세요.',
    dtoKey: 'dto', // Free 게시판은 dto 사용
  },
  // 공지
  notice: {
    tagApi: '/api/notice-tags/list',
    postApi: '/api/notice-posts',
    placeholder: '공지사항을 입력해 주세요.',
    dtoKey: 'dto',
  },
  // 활동일지
  activity: {
    tagApi: '/api/activity-tags/list',
    postApi: '/api/activity-posts',
    placeholder: '활동 내용을 기록해 주세요.',
    dtoKey: 'dto',
  }
}

function BoardWrite() {
  // 익명 상태 추가
  const [isAnonymous, setIsAnonymous] = useState(false);

  // URL에서 어떤 게시판인지 받아옴 (예: /write/tip)
  const { boardType } = useParams<{ boardType: string }>();

  const config = BOARD_CONFIG[boardType as keyof typeof BOARD_CONFIG] || BOARD_CONFIG.free;

  const navigate = useNavigate();
  const editorRef = useRef<RichTextEditorHandle | null>(null);

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagList, setTagList] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pickedImage, setPickedImage] = useState<File | null>(null)
  const [pickedPreviewUrl, setPickedPreviewUrl] = useState<string | null>(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    return () => {
      if (pickedPreviewUrl && pickedPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pickedPreviewUrl)
      }
    }
  }, [pickedPreviewUrl])

  // 해당 게시판의 태그 목록 가져오기
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const res = await api.get(config.tagApi)
        const normalized = (res.data ?? []).map((t: any) => ({
          id: Number(t.id),
          tagName: String(t.tagName ?? t.name ?? ''),
        }))
        setTagList(normalized)
      } catch {
        setTagList([{ id: 1, tagName: '공통' }])
      } finally {
        setLoadingTags(false)
      }
    }
    fetchTags()
  }, [config.tagApi])

  const handleTagToggle = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const handlePickImageFile = useCallback((file: File, previewUrl: string) => {
    if (pickedPreviewUrl && pickedPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pickedPreviewUrl)
    }
    setPickedImage(file)
    setPickedPreviewUrl(previewUrl)
  }, [pickedPreviewUrl])

  const isReadyToSubmit = useMemo(() => {
    const textOnly = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const hasTitleAndContent = title.trim().length > 0 && textOnly.length > 0;
    
    // 분류가 존재하는 게시판 리스트
    const needsTags = ['tip', 'qna', 'free'].includes(boardType || '');

    if (needsTags) {
      // 태그가 있는 게시판은 제목 + 내용 + 태그가 모두 있어야 함
      return hasTitleAndContent && selectedTagIds.length > 0;
    }
    
    // 공지, 활동일지는 제목과 내용만 있으면 됨
    return hasTitleAndContent;
  }, [title, content, selectedTagIds, boardType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || loadingTags || !isReadyToSubmit) return

    setSubmitting(true)
    try {
      const contentForServer = replaceFirstDataUrlImgWithToken(content)
      const payload: PostCreateReq = {
        title: title.trim(),
        content: contentForServer,
        tagIds: selectedTagIds,
      }

      const form = new FormData()
      if (pickedImage) form.append('image', pickedImage)
      
      // 게시판별로 다른 dtoKey(dto 또는 request) 사용
      form.append(
        config.dtoKey,
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      )

      const { data } = await api.post<PostCreateRes>(config.postApi, form)
      const newId = (data as any)?.id ?? (data as any)?.postId

      toastSuccess('작성이 완료되었습니다.')
      // 작성 후 해당 게시판 상세 페이지로 이동
      const currentPath = boardType?.toLowerCase() || 'free'
      navigate(`/${currentPath}/${newId}`)

    } catch (err: any) {
      toastError(err?.response?.data?.message || '글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelClick = () => {
  // 내용이 있을 때만 모달을 띄우고 싶다면 조건 추가 가능
  if (title.trim() || content.trim()) {
    setShowLeaveModal(true);
  } else {
    navigate(-1);
  }
};

  return (
    <>
      <HomeBar />
      <div className="board-write-container max-w-[1200px] pt-2">
        <h1 className="mb-5 font-bold text-title-1 text-label-normal">
          글쓰기
        </h1>

        <form className="write-form" onSubmit={handleSubmit}>
          {/* 제목 */}
          <p className="write-label">
            제목 <span className="text-system-red">*</span>
          </p>
          <input
            type="text"
            className="w-full px-4 py-3 bg-white border outline-none write-title-input border-line-normal rounded-xl text-label-normal text-body-1"
            placeholder="제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 분류(태그) */}
          {['tip', 'qna', 'free'].includes(boardType || '') && (
            <div>
              <p className="mt-4 write-label">
                분류 <span className="text-system-red">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id)
                  return (
                    <Button
                      key={tag.id}
                      type="button"
                      variant="outlined"
                      size="outlinedS"
                      aria-pressed={selected}
                      onClick={() => handleTagToggle(tag.id)}
                      className={clsx(
                        selected
                          ? '!border-line-active text-label-primary bg-background-blue'
                          : 'border-line-normal text-label-normal'
                      )}
                    >
                      #{tag.tagName}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 본문 */}
          <p className="mt-4 write-label">
            내용 <span className="text-system-red">*</span>
          </p>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="후배가 더 빨리 적응할 수 있도록 경험을 나눠주세요."
            minHeight={300}
            variant="post"
            onPickImageFile={handlePickImageFile}
          />

          {/* 등록 버튼 */}
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer select-none group">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                />
                {/* 체크박스 UI */}
                <div
                  className={clsx(
                    "w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all",
                    isAnonymous 
                      ? "border-line-active bg-background-blue" 
                      : "border-line-normal bg-white" 
                  )}
                >
                  {isAnonymous && (
                    <div className="w-2.5 h-2.5 bg-label-primary rounded-full" />
                  )}
                </div>
                {/* 텍스트 라벨 */}
                <span className="ml-2 text-body-1 text-label-normal">
                  익명으로 작성
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outlined"
                size="outlinedM"
                onClick={handleCancelClick}
                className="w-[120px] h-11"
              >
                취소
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="outlinedM"
                disabled={submitting || loadingTags || !isReadyToSubmit}
                className={clsx(
                  'w-[120px] h-11',
                  (!isReadyToSubmit || submitting || loadingTags) &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                {submitting ? '등록 중…' : '등록'}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {/* 나가기 모달 */}
      <LeaveModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)} // '계속 작성하기' 클릭 시 동작
        onLeave={() => navigate(-1)}             // '나가기' 클릭 시 동작
      />
    </>
  )
}
export default BoardWrite;