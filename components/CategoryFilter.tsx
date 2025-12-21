/**
 * CategoryFilter.tsx - 카테고리 필터 (TypeScript 버전)
 */

import styles from '../styles/CategoryFilter.module.css';
import type { Category } from '../types';

interface CategoryItem {
  code: Category | 'all';
  label: string;
}

interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (categoryCode: Category | 'all') => void;
}

const CATEGORIES: CategoryItem[] = [
  { code: 'all', label: '전체' },
  { code: 'TOP', label: '상의' },
  { code: 'BOTTOM', label: '하의' },
  { code: 'OUTER', label: '아우터' },
  { code: 'SHOES', label: '신발' },
  { code: 'ETC', label: '기타' },
];

function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const handleCategoryClick = (categoryCode: Category | 'all') => {
    onCategoryChange(categoryCode);
  };

  return (
    <div className={styles.container} role="radiogroup" aria-label="카테고리 필터">
      {CATEGORIES.map((category) => {
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
