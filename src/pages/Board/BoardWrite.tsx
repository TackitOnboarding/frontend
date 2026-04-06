import React, { useState, useEffect, useMemo, useRef} from 'react'
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
import { toastError, toastSuccess } from '../../utils/toast'
import { replaceFirstDataUrlImgWithToken } from '../../utils/coverToken'
import LeaveModal from '../../components/modals/LeaveModal'

// 게시판별 설정 데이터
const BOARD_CONFIG = {
  tip: {
    postType: 'TIP',
    placeholder: '후배가 더 빨리 적응할 수 있도록 경험을 나눠주세요.',
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
    placeholder: '궁금한 점을 자유롭게 질문해 주세요.',
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
    placeholder: '자유롭게 작성해 주세요.',
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
    placeholder: '공지사항을 입력해 주세요.',
    categories: [] 
  },
  activity: {
    postType: "ACTIVITY",
    placeholder: '활동 내용을 기록해 주세요.',
    categories: [] 
  }
}

function BoardWrite() {
  const { boardType } = useParams<{ boardType: string }>();

  const navigate = useNavigate();
  const editorRef = useRef<RichTextEditorHandle | null>(null);

  const activeProfileId = localStorage.getItem('activeProfileId');

  const config = BOARD_CONFIG[boardType as keyof typeof BOARD_CONFIG] || BOARD_CONFIG.free;

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // 단일 선택 ENUM
  const [isAnonymous, setIsAnonymous] = useState(false);
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

  const isReadyToSubmit = useMemo(() => {
    const textOnly = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const hasTitleAndContent = title.trim().length > 0 && textOnly.length > 0;
    const needsCategory = config.categories.length > 0;

    return needsCategory ? (hasTitleAndContent && selectedCategory !== null) : hasTitleAndContent;
  }, [title, content, selectedCategory, config]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || !isReadyToSubmit) return

    setSubmitting(true)
    try {
      const contentForServer = replaceFirstDataUrlImgWithToken(content)

      // 명세서 규격에 맞춘 Payload 생성
      const payload = {
        postType: config.postType, // TIP, QNA 등
        postCategory: selectedCategory || null, // ENUM value
        title: title.trim(),
        content: contentForServer,
        isAnonymous: isAnonymous,
        commentEnabled: true // 기본값
      };

      let res;
      if (pickedImage) {
        // 이미지가 있는 경우 Multipart 전송
        const form = new FormData();
        form.append('image', pickedImage);
        form.append('dto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        
        res = await api.post('/api/posts', form, {
          headers: { 
            'Active-Profile-Id': activeProfileId,
            'Content-Type': 'multipart/form-data' 
          }
        });
      } else {
        // 이미지가 없는 경우 순수 JSON 전송 (서버 컨트롤러 설정에 따라 시도)
        res = await api.post('/api/posts', payload, {
          headers: { 'Active-Profile-Id': activeProfileId }
        });
      }

      // 명세서 응답 구조 반영: content[0].postId 또는 content.postId 확인 필요
      const newId = res.data.content[0]?.postId || res.data.content.postId; 

      toastSuccess('작성이 완료되었습니다.');
      navigate(`/board/${boardType}/${newId}`);

    } catch (err: any) {
      // 500 에러 시 서버에서 보내주는 상세 메시지 출력 유도
      const serverMessage = err?.response?.data?.status?.message || err?.response?.data?.message;
      toastError(serverMessage || '글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

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
          {config.categories.length > 0 && (
            <div>
              <p className="mt-4 write-label">
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
                    >
                      #{cat.label}
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
            onPickImageFile={(file, url) => {
              setPickedImage(file);
              setPickedPreviewUrl(url);
            }}
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
                disabled={submitting || !isReadyToSubmit}
                className={clsx(
                  'w-[120px] h-11',
                  (!isReadyToSubmit || submitting) &&
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