/**
 * CategoryFilter.tsx - 카테고리 필터 (TypeScript 버전)
 *
 * 카테고리 버튼 UI를 렌더링하고, 선택 상태를 부모에 전달합니다.
 * TypeScript 문법 포인트:
 * - `Category | 'all'`은 "카테고리 중 하나 또는 all"을 뜻합니다.
 */

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
  // 버튼 클릭 시 부모에 선택 값을 전달
  const handleCategoryClick = (categoryCode: Category | 'all') => {
    onCategoryChange(categoryCode);
  };

  return (
    <div className={styles.container} role="radiogroup" aria-label="카테고리 필터">
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
            onClick={() => handleCategoryClick(category.code)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
