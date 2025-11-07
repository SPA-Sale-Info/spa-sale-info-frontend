/**
 * BrandFilter.js - 완전히 새로운 브랜드 필터 컴포넌트
 *
 * 프리미엄 디자인의 필터 버튼
 */

import Image from 'next/image'
import styles from '../styles/BrandFilter.module.css'

// 사용자가 누를 수 있는 브랜드 버튼 목록입니다.
const BRANDS = [
  { code: 'all', name: '전체', logo: null, emoji: '🛍️' },
  { code: 'HM', name: 'H&M', logo: '/logos/hm.svg' },
  { code: 'ZARA', name: 'ZARA', logo: '/logos/zara.svg' },
  { code: 'UNIQLO', name: 'UNIQLO', logo: '/logos/uniqlo.svg' },
  { code: 'MUJI', name: 'MUJI', logo: '/logos/muji.svg' },
]

function BrandFilter({ selectedBrand, onBrandChange }) {
  // 버튼을 누르면 상위 컴포넌트(Home)가 선택한 브랜드를 기억합니다.
  const handleBrandClick = (brandCode) => {
    onBrandChange(brandCode)
  }

  return (
    <div className={styles.filterContainer}>
      <div className={styles.buttonGroup}>
        {BRANDS.map((brand) => {
          const isSelected = selectedBrand === brand.code
          const buttonClassName = `${styles.button} ${isSelected ? styles.selected : ''}`

          // 각 브랜드마다 버튼을 하나씩 그립니다.
          return (
            <button
              key={brand.code}
              className={buttonClassName}
              onClick={() => handleBrandClick(brand.code)}
              aria-pressed={isSelected}
              aria-label={`${brand.name} 필터`}
              type="button"
            >
              {brand.logo
                ? (
                  // 로고 파일이 있으면 이미지를 보여줍니다.
                  <span className={styles.logoContainer}>
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} 로고`}
                      width={56}
                      height={24}
                      className={styles.brandLogo}
                      sizes="56px"
                    />
                  </span>
                )
                : (
                  // 로고가 없으면 간단한 이모지를 보여줍니다.
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
