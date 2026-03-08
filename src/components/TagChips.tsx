/**
 * TagChips
 *
 * - Chip 컴포넌트를 그룹으로 관리하는 선택 컨트롤
 * - single / multiple 선택 모드 지원
 * - API 또는 fallback 데이터 기반 태그 렌더링
 * - value / onChange를 통한 제어 컴포넌트
 */

import { useMemo } from 'react'
import Chip from './Chip'
import api from '../api/api'

type Mode = 'single' | 'multiple'
type CategoryItem = { label: string; value: string | number }

type Props = {
  mode?: Mode
  value?: number | string | (number | string)[] | null
  onChange?: (v: any) => void
  includeAllItem?: boolean
  className?: string
  gapPx?: number
  categories?: CategoryItem[]
}

export default function TagChips({
  mode = 'single',
  value = null,
  onChange,
  includeAllItem = false,
  className = '',
  gapPx = 10,
  categories = [],
}: Props) {
  const items = useMemo(() => {
    const base = categories.map(cat => ({
      id: cat.value, // ENUM 값 (예: EXPERIENCE)
      name: cat.label // UI 표시용 (예: 경험담 공유)
    }));
    // 전체 항목 추가 시 ID를 'ALL'로 지정하여 null 값과 구분합니다.
    return includeAllItem ? [{ id: 'ALL', name: '전체' }, ...base] : base;
  }, [includeAllItem, categories]);

  const selectedSet = useMemo(() => {
    if (mode === 'single') {
      // 값이 null이거나 'ALL'이면 '전체' 칩을 활성화합니다.
      const hasValue = value !== null && value !== undefined && value !== 'ALL';
      return new Set(hasValue ? [String(value)] : ['ALL']);
    }
    const arr = Array.isArray(value) ? (value as any[]) : [];
    return new Set(arr.map(String));
  }, [value, mode]);

  const toggle = (id: number | string) => {
    if (!onChange) return;
    const key = String(id);

    if (mode === 'single') {
      // '전체'를 누르면 부모에게 null을 전달하여 카테고리 필터링을 해제합니다.
      if (key === 'ALL') {
        onChange(null);
        return;
      }
      // 이미 선택된 항목을 다시 누르면 '전체'(null)로 돌아갑니다.
      onChange(selectedSet.has(key) ? null : id);
    } else {
      const next = new Set(selectedSet);
      next.has(key) ? next.delete(key) : next.add(key);
      onChange(Array.from(next));
    }
  };


  return (
    <div
      className={`flex flex-wrap ${className}`}
      style={{ gap: `${gapPx}px` }}
    >
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.name}
          selected={selectedSet.has(String(item.id))}
          onClick={() => toggle(item.id)}
        />
      ))}
    </div>
  )
}
