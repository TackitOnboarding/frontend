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
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'
import { PostUpdateReq, PostCreateRes } from '../../types/post'
import {
  hydrateCoverToken,
  replaceFirstDataUrlImgWithToken,
} from '../../utils/coverToken'

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
}

function BoardEdit() {
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
    const textOnly = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    return title.trim().length > 0 && textOnly.length > 0 && selectedTagIds.length > 0
  }, [title, content, selectedTagIds])

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
            placeholder="제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border outline-none border-line-normal rounded-xl text-label-normal text-body-1"
            disabled={loading}
          />

          {/* 분류(태그) */}
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

          {/* 하단 버튼 영역 */}
          <div className="flex justify-center mb-4">
            <Button
              type="submit"
              variant="primary"
              size="m"
              disabled={saving || loading || !isReadyToSubmit}
              className={clsx(
                'w-[120px] h-11',
                (!isReadyToSubmit || saving || loading) &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              {saving ? '저장 중…' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default BoardEdit;