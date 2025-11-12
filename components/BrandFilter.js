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
  { code: 'COS', name: 'COS', logo: '/logos/cos.svg', noSale: true },
  { code: 'ARKET', name: 'ARKET', logo: '/logos/arket.svg', noSale: true },
  { code: 'MASSIMODUTTI', name: 'Massimo Dutti', logo: '/logos/massimodutti.svg', emoji: '🧥', comingSoon: true, bubblePosition: 'bottom' },
  { code: 'MANGO', name: 'Mango', logo: '/logos/mango.svg', emoji: '🥭', comingSoon: true, bubblePosition: 'bottom' },
]

function BrandFilter({ selectedBrand, onBrandChange }) {
  // 버튼을 누르면 상위 컴포넌트(Home)가 선택한 브랜드를 기억합니다.
  const handleBrandClick = (brandCode, isDisabled) => {
    if (isDisabled) {
      return
    }
    onBrandChange(brandCode)
  }

  return (
    <div className={styles.filterContainer}>
      <div className={styles.buttonGroup}>
        {BRANDS.map((brand) => {
          const isSelected = selectedBrand === brand.code
          const buttonClassName = [
            styles.button,
            isSelected ? styles.selected : '',
            brand.comingSoon ? styles.buttonDisabled : '',
          ].filter(Boolean).join(' ')

          const buttonContent = (
            <>
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
            </>
          )

          const button = (
            <button
              className={buttonClassName}
              onClick={() => handleBrandClick(brand.code, brand.comingSoon)}
              aria-pressed={isSelected}
              aria-label={`${brand.name} 필터${brand.comingSoon ? ' (곧 추가될 예정)' : ''}`}
              type="button"
              disabled={brand.comingSoon}
              aria-disabled={brand.comingSoon}
              title={brand.comingSoon ? '곧 추가될 예정이에요!' : undefined}
            >
              {buttonContent}
            </button>
          )

          const wrapperClass = brand.comingSoon ? styles.comingSoonWrapper : styles.buttonWrapper
          const bubbleClass = brand.bubblePosition === 'bottom'
            ? styles.comingSoonBubbleBottom
            : styles.comingSoonBubble

          return (
            <div key={brand.code} className={wrapperClass}>
              {button}
              {brand.comingSoon && (
                <span className={styles.comingSoonTooltip} role="status" aria-live="polite">
                  곧 추가될 예정이에요!
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BrandFilter
