import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import './BoardWrite.css'
import { useParams, useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import RichTextEditor, {
  RichTextEditorHandle,
} from '../../components/editor/RichTextEditor'
import { toastSuccess, toastError } from '../../utils/toast'
// import { PostUpdateReq, PostCreateRes } from '../../types/post'
import {
  hydrateCoverToken,
  replaceFirstDataUrlImgWithToken,
} from '../../utils/coverToken'
import LeaveModal from '../../components/modals/LeaveModal'

type BoardType = 'tip' | 'qna' | 'free'
type Tag = { id: number; tagName: string }

// 게시판별 설정 데이터
const BOARD_CONFIG = {
  tip: {
    tagApi: '/api/tip-tags/list',
    postApi: (id: string) => `/api/tip-posts/${id}`,
    placeholder: '경험을 나눠주세요.',
    dtoKey: 'dto',
  },
  qna: {
    tagApi: '/api/qna-tags/list',
    postApi: (id: string) => `/api/qna-posts/${id}`,
    placeholder: '궁금한 점을 질문해 주세요.',
    dtoKey: 'request',
  },
  free: {
    tagApi: '/api/free_tags',
    postApi: (id: string) => `/api/free-posts/${id}`,
    placeholder: '자유롭게 이야기를 나눠주세요.',
    dtoKey: 'req',
  },
  notice: {
    postApi: (id: string) => `/api/notice-posts/${id}`,
    placeholder: '공지할 내용을 작성해 주세요.',
    dtoKey: 'dto',
  },
}

function BoardEdit() {
  // 익명 상태 추가
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { boardType, id } = useParams<{ boardType: string; id: string }>()
  const navigate = useNavigate()

  const type = (boardType?.toLowerCase() as BoardType) || 'free'
  const config = BOARD_CONFIG[type]
  const targetId = id || '' // URL 파라미터 통합 사용

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagList, setTagList] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pickedImage, setPickedImage] = useState<File | null>(null)
  const [pickedPreviewUrl, setPickedPreviewUrl] = useState<string | null>(null)
  const [removeImage] = useState<boolean>(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const editorRef = useRef<RichTextEditorHandle | null>(null)

  useEffect(() => {
    return () => {
      if (pickedPreviewUrl && pickedPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pickedPreviewUrl)
      }
    }
  }, [pickedPreviewUrl])

  // 데이터 로드
  useEffect(() => {
    if (!targetId || !config) return
    const fetchAll = async () => {
      setLoading(true)
      try {
        // 1) 태그 목록 조회
        const tagRes = await api.get(config.tagApi)
        const tagNormalized: Tag[] = (tagRes.data ?? []).map((t: any) => ({
          id: Number(t.id),
          tagName: String(t.tagName ?? t.name ?? ''),
        }))
        setTagList(tagNormalized)

        // 2) 게시글 상세 조회
        const postRes = await api.get(config.postApi(targetId))
        const p = postRes.data
        
        setTitle(p.title ?? '')
        setContent(hydrateCoverToken(String(p.content ?? ''), p.imageUrl ?? null))

        const matched = tagNormalized.filter((t) =>
          (p.tags ?? []).includes(t.tagName)
        )
        setSelectedTagIds(matched.map((t) => t.id))
      } catch {
        toastError('정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [targetId, config])

  const handleTagToggle = (tid: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tid) ? prev.filter((v) => v !== tid) : [...prev, tid]
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


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetId || !isReadyToSubmit) return

    setSaving(true)
    try {
      const contentForServer = replaceFirstDataUrlImgWithToken(content)
      const payload = {
        title: title.trim(),
        content: contentForServer,
        tagIds: selectedTagIds,
        removeImage,
      }

      const form = new FormData()
      // 게시판별 맞춤 DTO 키 적용 (dto, request, req)
      form.append(
        config.dtoKey,
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      )
      if (pickedImage) form.append('image', pickedImage)

      await api.put(config.postApi(targetId), form)
      toastSuccess('게시글이 수정되었습니다.')
      
      const currentPath = boardType?.toLowerCase() || 'free'
      navigate(`/${currentPath}/${targetId}`)
    } catch (err: any) {
      toastError(err?.response?.data?.message || '수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelClick = () => {
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
        <h1
          className="mb-5 font-bold cursor-pointer text-title-1 text-label-normal"
          onClick={() => navigate('/board')}
        >
          글 수정
        </h1>

        <form className="write-form" onSubmit={handleSave}>
          {/* 제목 */}
          <p className="mt-4 text-label-normal text-body-1sb">
            제목 <span className="text-system-red">*</span>
          </p>
          <input
            type="text"
            placeholder="내용을 대표할 수 있는 제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border outline-none border-line-normal rounded-xl text-label-normal text-body-1"
            disabled={loading}
          />

          {/* 분류(태그) */}
          {['tip', 'qna', 'free'].includes(boardType || '') && (
            <div>
              <p className="mt-4 text-label-normal text-body-1sb">
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
                      disabled={loading}
                    >
                      #{tag.tagName}
                    </Button>
                  )
                })}
            </div>
          </div>
          )}

          {/* 내용 */}
          <p className="mt-6 text-label-normal text-body-1sb">
            내용 <span className="text-system-red">*</span>
          </p>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder={config.placeholder}
            minHeight={300}
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
                disabled={saving || loading || !isReadyToSubmit}
                className={clsx(
                  'w-[120px] h-11',
                  (!isReadyToSubmit || saving || loading) &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                {saving ? '등록 중…' : '등록'}
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

export default BoardEdit;