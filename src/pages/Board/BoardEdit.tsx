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
import {
  hydrateCoverToken,
  replaceFirstDataUrlImgWithToken,
} from '../../utils/coverToken'
import LeaveModal from '../../components/modals/LeaveModal'

// 게시판별 설정 및 카테고리 데이터 통합
const BOARD_CONFIG = {
  tip: {
    postType: 'TIP',
    placeholder: '경험을 나눠주세요.',
    categories: [
      { label: '경험담 공유', value: 'EXPERIENCE' },
      { label: '교육&멘토링', value: 'MENTORING' },
      { label: '온보딩', value: 'ONBOARDING' },
      { label: '유용한 팁', value: 'USEFUL_TIP' },
      { label: '팀 문화', value: 'TEAM_CULTURE' },
    ]
  },
  qna: {
    postType: 'QNA',
    placeholder: '궁금한 점을 질문해 주세요.',
    categories: [
      { label: '문화적응', value: 'CULTURE_ADAPT' },
      { label: '소통고민', value: 'COMMUNICATION' },
      { label: '신입고민', value: 'JUNIOR_CONCERN' },
      { label: '운영&제도', value: 'SYSTEM' },
      { label: '활동질문', value: 'ACTIVITY_QUESTION' },
    ]
  },
  free: {
    postType: 'FREE',
    placeholder: '자유롭게 이야기를 나눠주세요.',
    categories: [
      { label: '맛집추천', value: 'TASTY_RESTAURANT' },
      { label: '자료공유', value: 'RESOURCE_SHARE' },
      { label: '자유토론', value: 'DISCUSSION' },
      { label: '취미생활', value: 'HOBBY' },
      { label: '활동일상', value: 'DAILY_ACTIVITY' },
    ]
  },
  notice: {
    postType: 'NOTICE',
    placeholder: '공지할 내용을 작성해 주세요.',
    categories: []
  },
  activity: {
    postType: "ACTIVITY",
    placeholder: '활동 내용을 기록해 주세요.',
    categories: [] 
  }
}


function BoardEdit() {

  const { boardType, id } = useParams<{ boardType: string; id: string }>()
  const navigate = useNavigate()

  const activeProfileId = localStorage.getItem('activeProfileId')
  const config = BOARD_CONFIG[boardType as keyof typeof BOARD_CONFIG] || BOARD_CONFIG.free;

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false);
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
    if (!id) return
    const fetchPost = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/posts/${id}`, {
          headers: { 'Active-Member-Id': activeProfileId }
        })
        const p = res.data.content.post;
        
        setTitle(p.title ?? '')
        setContent(hydrateCoverToken(String(p.content ?? ''), p.imageUrl ?? null))
        setIsAnonymous(!!p.isAnonymous)
        // 서버에서 내려온 카테고리 key값을 상태에 매핑
        if (p.postCategory) {
          setSelectedCategory(p.postCategory.key || p.postCategory)
        }
      } catch {
        toastError('정보를 불러오지 못했습니다.')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id, activeProfileId, navigate])


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
    const needsCategory = config.categories.length > 0;

    return needsCategory ? (hasTitleAndContent && selectedCategory !== null) : hasTitleAndContent;
  }, [title, content, selectedCategory, config]);

  // 수정
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !isReadyToSubmit || saving) return

    setSaving(true)
    try {
      const contentForServer = replaceFirstDataUrlImgWithToken(content)
      
      const payload = {
        postType: config.postType,
        postCategory: selectedCategory,
        title: title.trim(),
        content: contentForServer,
        isAnonymous: isAnonymous,
        commentEnabled: true
      }

      const form = new FormData()
      form.append(
        'dto', // 통합 DTO 키
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      )
      if (pickedImage) form.append('image', pickedImage)

      // PUT 메서드 사용
      await api.put(`/api/posts/${id}`, form, {
        headers: { 
          'Active-Member-Id': activeProfileId,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toastSuccess('게시글 수정 성공');
      navigate(`/board/${boardType}/${id}`);
    } catch (err: any) {
      toastError(err?.response?.data?.message || '수정에 실패했습니다.');
    }
  }

  const handleCancelClick = () => {
    if (title.trim() || content.trim()) {
      setShowLeaveModal(true);
    } else {
      navigate(-1);
    }
  };

  if (loading) return (
    <><HomeBar /><div className="board-write-container max-w-[1200px] pt-10">정보를 불러오는 중...</div></>
  )

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
          {config.categories.length > 0 && (
            <div>
              <p className="mt-4 text-label-normal text-body-1sb">
                분류 <span className="text-system-red">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {config.categories.map((cat) => {
                  const selected = selectedCategory === cat.value
                  return (
                    <Button
                      key={cat.value}
                      type="button"
                      variant="outlined"
                      size="outlinedS"
                      aria-pressed={selected}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={clsx(
                        selected
                          ? '!border-line-active text-label-primary bg-background-blue'
                          : 'border-line-normal text-label-normal'
                      )}
                      disabled={loading}
                    >
                      #{cat.label}
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