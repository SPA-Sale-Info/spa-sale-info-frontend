/**
 * CategoryFilter.tsx - 카테고리 필터 (TypeScript 버전)
 *
 * 카테고리 버튼 UI를 렌더링하고, 선택 상태를 부모에 전달합니다.
 * v4 변경사항: 슬라이딩 인디케이터 추가 (GenderFilter와 동일한 패턴)
 * - useRef/useLayoutEffect로 선택된 버튼의 DOM 위치를 읽어 인디케이터를 spring 애니메이션으로 이동시킵니다.
 */

import { useRef, useState, useLayoutEffect } from 'react';
import styles from '../styles/CategoryFilter.module.css';
import type { Category } from '../types';

// 카테고리 버튼 한 개가 가져야 할 데이터 구조
interface CategoryItem {
  code: Category | 'all';
  label: string;
}

// 컴포넌트에 전달되는 props 타입
interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (categoryCode: Category | 'all') => void;
}

// 화면에 표시할 카테고리 목록
const CATEGORIES: CategoryItem[] = [
  { code: 'all', label: '전체' },
  { code: 'TOP', label: '상의' },
  { code: 'BOTTOM', label: '하의' },
  { code: 'OUTER', label: '아우터' },
  { code: 'SHOES', label: '신발' },
  { code: 'ETC', label: '기타' },
];

function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  // GenderFilter와 동일한 슬라이딩 인디케이터 패턴을 적용합니다.
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  // 선택된 카테고리가 바뀔 때마다 해당 버튼의 DOM 위치를 읽어 인디케이터를 이동시킵니다.
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const btn = containerRef.current.querySelector('[aria-pressed="true"]') as HTMLElement | null;
    if (!btn) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true });
  }, [selectedCategory]);

  return (
    <div className={styles.container} ref={containerRef} role="radiogroup" aria-label="카테고리 필터">
      {/* 슬라이딩 인디케이터 */}
      <span
        className={styles.indicator}
        aria-hidden="true"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          opacity: indicator.ready ? 1 : 0,
          transition: indicator.ready
            ? 'left 380ms var(--ease-spring), width 380ms var(--ease-spring), opacity 120ms'
            : 'none',
        }}
      />
      {CATEGORIES.map((category) => {
        // 선택 여부에 따라 스타일을 다르게 적용
        const isSelected = selectedCategory === category.code;
        const className = `${styles.button} ${isSelected ? styles.selected : ''}`;

        return (
          <button
            key={category.code}
            type="button"
            className={className}
            aria-pressed={isSelected}
            aria-label={`${category.label} 상품만 보기`}
            onClick={() => onCategoryChange(category.code)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
