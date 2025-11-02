/**
 * BrandFilter.js - 완전히 새로운 브랜드 필터 컴포넌트
 *
 * 프리미엄 디자인의 필터 버튼
 */

import Image from 'next/image'
import styles from '../styles/BrandFilter.module.css'

const BRANDS = [
  { code: 'all', name: '전체', logo: null, emoji: '🛍️' },
  { code: 'HM', name: 'H&M', logo: '/logos/hm.svg' },
  { code: 'ZARA', name: 'ZARA', logo: '/logos/zara.svg' },
  { code: 'UNIQLO', name: 'UNIQLO', logo: '/logos/uniqlo.svg' },
  { code: 'MUJI', name: 'MUJI', logo: '/logos/muji.svg' },
  { code: 'COS', name: 'COS', logo: '/logos/cos.svg' },
]

function BrandFilter({ selectedBrand, onBrandChange }) {
  const handleBrandClick = (brandCode) => {
    onBrandChange(brandCode)
  }

  return (
    <div className={styles.filterContainer}>
      <div className={styles.buttonGroup}>
        {BRANDS.map((brand) => {
          const isSelected = selectedBrand === brand.code
          const buttonClassName = `${styles.button} ${isSelected ? styles.selected : ''}`

          return (
            <button
              key={brand.code}
              className={buttonClassName}
              onClick={() => handleBrandClick(brand.code)}
              aria-pressed={isSelected}
              aria-label={`${brand.name} 필터`}
            >
              {brand.logo ? (
                <span className={styles.logoContainer}>
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className={styles.brandLogo}
                  />
                </span>
              ) : (
                <span>{brand.emoji}</span>
              )}
              <span className={styles.brandName}>{brand.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BrandFilter
