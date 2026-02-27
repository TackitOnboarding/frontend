import { useState, useEffect } from "react";
import { RegisterModal } from "../modals/RegisterModal";
import api from "../../api/api";
import { toastSuccess, toastError } from "../../utils/toast";
import { Button } from '../ui/Button';
import TextField from "../forms/TextField";
import { MiniCalendar } from "../calendar/MiniCalendar";


interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  inEdit?: boolean;      // 수정 모드 여부
  initialData?: any;     // 수정 시 전달받을 데이터
  orgId: number;
}

const CATEGORIES = [
  { id: 'FOOD', label: '식비' },
  { id: 'STUFF', label: '사무용품' },
  { id: 'EVENT', label: '행사' },
  { id: 'ETC', label: '기타' },
];

export const PayModal = ({isOpen, onClose, inEdit, initialData, orgId} : PayModalProps) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    category: 'FOOD' as 'FOOD' | 'STUFF' | 'EVENT' | 'ETC',
    storeName: '',
    amount: '',
    transactionType: 'EXPENSE' as 'INCOME' | 'EXPENSE', // 수입/지출 선택 추가
    description: '',
  });

  useEffect(() => {
    if (isOpen && inEdit && initialData) {
      setFormData({
        transactionDate: initialData.transactionDate || new Date().toISOString().split('T')[0],
        category: initialData.category || 'FOOD',
        storeName: initialData.storeName || '',
        amount: String(initialData.amount || ''),
        transactionType: initialData.transactionType || 'EXPENSE',
        description: initialData.description || '',
      });
    } else if (!isOpen) {
      setFormData({ 
        transactionDate: new Date().toISOString().split('T')[0], 
        category: 'FOOD', 
        storeName: '', 
        amount: '', 
        transactionType: 'EXPENSE', 
        description: '' 
      });
    }
  }, [isOpen, inEdit, initialData]);

  const isFormValid = formData.storeName.trim() !== "" && formData.amount !== "";

  const handleAction = async () => {
    if (!isFormValid) return;
    setLoading(true);

    // 명세서 규격에 맞춘 Payload 가공
    const payload = {
      orgId: Number(orgId),
      transactionDate: formData.transactionDate,
      category: formData.category,
      storeName: formData.storeName,
      amount: Number(formData.amount.replace(/,/g, '')),
      transactionType: formData.transactionType,
      description: formData.description || null, // NULL 허용
    };

    try {
      if (inEdit) {
        await api.put(`/api/accountings/${initialData.transactionId}`, payload);
        toastSuccess("수정되었습니다.");
      } else {
        await api.post('/api/accountings', payload); // Path: /api/accountings
        toastSuccess("거래 내역이 생성되었습니다.");
      }
      onClose();
    } catch (error: any) {
      // 에러 메시지 처리 (403 Forbidden 등)
      const errorMsg = error.response?.data?.status?.message || "내역 등록에 실패했습니다.";
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-8 px-6">
        <h2 className="text-title1-bold text-label-normal text-center">내역 등록하기</h2>
        <div className="flex flex-col gap-6">
          <Button
            variant="outlined"
            size="m"
            className="w-full mt-2 items-center"
          ><img src="/icons/camera.svg" alt="scan" className="w-6 h-6" />영수증 스캔하기</Button>

          <div className="flex flex-col gap-2">
            <div className="relative">
              <TextField
                id="transcationDate"
                label="날짜"
                required
                placeholder="날짜를 선택해주세요"
                value={formData.transactionDate.replace(/-/g, '.')}
                className="cursor-pointer mb-0"
                rightIconSrc="/icons/calendar.svg"
                dropdownOptions={[]}
                onChange={() => {}}
                onBlur={() => {}}
              />
              {/* 클릭 레이어 */}
              <div className="absolute inset-0 top-8 z-10 cursor-pointer" onClick={() => setOpenCalendar(!openCalendar)} />
              {openCalendar && (
                <div className="absolute top-full mt-[-10px] z-50">
                  <MiniCalendar
                    currentDate={formData.transactionDate}
                    onSelect={(date) => {
                      setFormData({ ...formData, transactionDate: date.toISOString().split('T')[0] });
                      setOpenCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-body-2sb text-label-normal">카테고리 <span className="text-system-red">*</span></label>
              <div className="flex gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id as any })}
                    className={`px-3 py-2 rounded-lg border text-body-2sb transition-colors ${
                      formData.category === cat.id
                        ? 'border-interaction-normal text-interaction-normal' 
                        : 'border-line-normal text-label-neutral bg-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <TextField
              id="storeName"
              label="가맹점명"
              required
              placeholder="예: 스타벅스 강남점"
              className="mb-0"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            />

            <TextField
              id="amount"
              label="금액(원)"
              required
              placeholder="금액을 입력해주세요."
              className="mb-0"
              value={formData.amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setFormData({ ...formData, amount: val });
              }}
            />

            <TextField
              id="description"
              label="상세 설명"
              required
              placeholder="사용 목적이나 구매 항목을 입력해주세요."
              className="mb-0"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Button
            variant="primary"
            size="m"
            className="w-full mt-2"
            disabled={!isFormValid}
            onClick={handleAction}
          >{inEdit ? "수정 완료" : "등록"}</Button>
        </div>
      </div>
    </RegisterModal>
  )
}