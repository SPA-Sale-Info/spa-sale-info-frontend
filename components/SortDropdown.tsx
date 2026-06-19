/**
 * SortDropdown.tsx - 상품 정렬 드롭다운 컴포넌트
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 사용자가 상품 목록의 정렬 기준(할인율 높은순/가격순/최신순/인기순)을
 * 선택할 수 있는 드롭다운을 제공합니다.
 *
 * 왜 필요한가요? (UX 관점)
 * "할인하는 옷을 쉽게 찾고 비교"하려면 정렬이 필수입니다.
 * - "할인율 높은순"으로 가장 싸진 상품을 먼저 보고,
 * - "가격 낮은순"으로 예산에 맞는 상품을 먼저 봅니다.
 * 정렬이 없으면 사용자는 서버가 주는 순서를 그대로 강요받습니다.
 *
 * 상태를 부모가 소유하는 패턴(Lifting State Up):
 * 이 컴포넌트는 현재 선택값(value)과 변경 콜백(onChange)만 props로 받습니다.
 * 실제 정렬 상태는 부모(index.tsx)가 소유하고, 변경 시 API를 다시 호출합니다.
 */

// 표준 <select>를 쓰는 이유: 네이티브 요소라 키보드 탐색/모바일 휠 피커/스크린리더
// 지원이 기본으로 따라오므로 접근성에 유리합니다.
import styles from '../styles/SortDropdown.module.css';
import { SORT_OPTIONS } from '../types';

/**
 * SortDropdownProps - 이 컴포넌트가 받는 props
 * - value: 현재 선택된 정렬 옵션의 value (예: 'discount_desc')
 * - onChange: 사용자가 다른 정렬을 고르면 호출되는 콜백
 */
interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className={styles.container}>
      {/* label과 select를 htmlFor/id로 연결해 접근성을 확보합니다. */}
      <label htmlFor="sort-select" className={styles.label}>정렬</label>
      <div className={styles.selectWrap}>
        <select
          id="sort-select"
          className={styles.select}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="상품 정렬 기준"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* 커스텀 화살표 아이콘 (네이티브 화살표는 CSS로 숨김) */}
        <span className={styles.arrow} aria-hidden="true">▾</span>
      </div>
    </div>
  );
}
