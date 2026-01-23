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
}

function BoardWrite() {
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
    const textOnly = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    return title.trim().length > 0 && textOnly.length > 0 && selectedTagIds.length > 0
  }, [title, content, selectedTagIds])

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
          <div className="flex justify-center mb-4">
            <Button
              type="submit"
              variant="primary"
              size="m"
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
        </form>
      </div>
    </>
  )
}
export default BoardWrite;