import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { toastError, toastSuccess } from '../../utils/toast'
import api from "../../api/api";
import Button from "../../components/ui/Button";
import Modal from "../../components/modals/Modal";

export default function ReportDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { report } = location.state || {};

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!report) return <div className="p-10 text-center">신고 정보를 찾을 수 없습니다.</div>;

  const handleConfirmAction = async () => {
    try {
      // 복구 API 호출 (예시 엔드포인트)
      await api.post(`/api/executive/reports/${report.reportId}/restore`);
      toastSuccess("성공적으로 복구되었습니다.");
      setIsModalOpen(false);
      navigate(-1); // 리스트로 돌아가기
    } catch (e) {
      toastError("복구 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col px-9 gap-2 items-start w-full">
      {/* 뒤로가기 버튼 */}
      <button onClick={() => navigate(-1)}>
        <img src="/icons/goBack.svg" alt="뒤로가기" className="w-8 h-8"/>
      </button>
      {/* 내용 */}
      <div className="flex flex-col gap-8 px-6 py-8 rounded-lg bg-white">
        <div className="flex flex-col gap-5">
          <h3 className="text-title-2b text-label-normal">상세 정보</h3>
          <div className="flex flex-col gap-2 items-start">
            {/* 유형 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">유형</p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.type}</p>
            </div>

            {/* 위치 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">위치</p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.location}</p>
            </div>

            {/* 신고내용 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">신고 내용</p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.content}</p>
            </div>

            {/* 신고 사유 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">신고 사유</p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.reason}</p>
            </div>

            {/* 작성자 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">작성자</p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.authorName}</p>
            </div>

            {/* 신고자 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">신고자</p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.reportName}</p>
            </div>

            {/* 상태 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">상태</p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.ReportStatus}</p>
            </div>

            {/* 신고일자 */}
            <div className="flex gap-5 py-1">
              <p className="w-20 text-label-neutral text-body-1">신고 일자 </p>
              <p className="text-label-neutral text-body-1">|</p>
              <p className="text-label-normal text-body-1">{report.reportedAt.split('T')[0].replaceAll('-', '.')}</p>
            </div>

          </div>

        </div>
        <Button
          type="button"
          variant="outlined"
          size="m"
          className="mx-auto  h-12 w-full"
        >
          복구
        </Button>

      </div>
      {/* 복구 확인 모달 */}
      <Modal
        open={isModalOpen}
        title={`${report.type}을 복구하시겠습니까?`}
        cancelText="취소"
        confirmText="네"
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
      />

    </div>
  )
}