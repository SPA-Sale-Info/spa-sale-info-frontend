/**
 * CategoryFilter.js - 카테고리 필터
 *
 * 상의 / 하의 / 아우터 / 신발 / 기타 중 하나를 선택할 수 있습니다.
 */

import styles from '../styles/CategoryFilter.module.css'

const CATEGORIES = [
  { code: 'all', label: '전체' },
  { code: 'TOP', label: '상의' },
  { code: 'BOTTOM', label: '하의' },
  { code: 'OUTER', label: '아우터' },
  { code: 'SHOES', label: '신발' },
  { code: 'ETC', label: '기타' },
]

function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const handleCategoryClick = (categoryCode) => {
    onCategoryChange(categoryCode)
  }

  return (
    <div className={styles.container} role="radiogroup" aria-label="카테고리 필터">
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.code
        const className = `${styles.button} ${isSelected ? styles.selected : ''}`

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
        )
      })}
    </div>
  )
}

export default CategoryFilter
