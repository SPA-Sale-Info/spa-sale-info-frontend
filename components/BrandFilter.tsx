/**
 * BrandFilter.tsx - 브랜드 필터 컴포넌트 (TypeScript 버전)
 *
 * 화면에서 브랜드 버튼을 선택/해제하는 UI를 렌더링합니다.
 * TypeScript 문법 포인트:
 * - interface는 객체 구조를 정의합니다.
 * - `Brand | 'all'` 처럼 유니온(|)으로 "여러 값 중 하나"를 표현합니다.
 */

import Image from 'next/image';
import styles from '../styles/BrandFilter.module.css';
import type { Brand } from '../types';

// 각 브랜드 버튼이 가져야 할 데이터 구조
interface BrandItem {
  code: string;
  name: string;
  logo?: string | null;
  emoji?: string;
  comingSoon?: boolean;
  noSale?: boolean;
  bubblePosition?: string;
}

// 컴포넌트에 전달되는 props 타입
interface BrandFilterProps {
  selectedBrand: Brand | 'all';
  onBrandChange: (brandCode: Brand | 'all') => void;
}

// 브랜드 버튼 목록 (정적 데이터)
const BRANDS: BrandItem[] = [
  { code: 'all', name: '전체', logo: null, emoji: '🛍️' },
  { code: 'HM', name: 'H&M', logo: '/logos/hm.svg' },
  { code: 'ZARA', name: 'ZARA', logo: '/logos/zara.svg' },
  { code: 'UNIQLO', name: 'UNIQLO', logo: '/logos/uniqlo.svg' },
  { code: 'MUJI', name: 'MUJI', logo: '/logos/muji.svg' },
  { code: 'CHARLESKEITH', name: '찰스앤키스', logo: '/logos/charleskeith.svg' },
  { code: 'COS', name: 'COS', logo: '/logos/cos.svg', noSale: true },
  { code: 'ARKET', name: 'ARKET', logo: '/logos/arket.svg', noSale: true },
  { code: 'MASSIMODUTTI', name: 'Massimo Dutti', logo: '/logos/massimodutti.svg', emoji: '🧥' },
  { code: 'MANGO', name: 'Mango', logo: '/logos/mango.svg', emoji: '🥭', comingSoon: true, bubblePosition: 'bottom' },
  { code: 'EIGHTSECONDS', name: '에잇세컨즈', logo: '/logos/eightseconds.svg', comingSoon: true },
  { code: 'MIXXO', name: '미쏘', logo: '/logos/mixxo.svg', comingSoon: true },
  { code: 'MUSINSASTANDARD', name: '무신사 스탠다드', logo: '/logos/musinsastandard.svg', comingSoon: true },
  { code: 'TOPTEN', name: '탑텐', logo: '/logos/topten.svg', comingSoon: true },
  { code: 'SPAO', name: '스파오', logo: '/logos/spao.svg', comingSoon: true },
  { code: 'GIORDANO', name: '지오다노', logo: '/logos/giordano.svg', comingSoon: true },
];

function BrandFilter({ selectedBrand, onBrandChange }: BrandFilterProps) {
  /**
   * 브랜드 버튼 클릭 핸들러
   * - comingSoon인 경우 클릭 무시
   * - 그렇지 않으면 부모 컴포넌트에 선택 변경 전달
   */
  const handleBrandClick = (brandCode: Brand | 'all', isDisabled?: boolean) => {
    if (isDisabled) {
      return;
    }
    onBrandChange(brandCode);
  };

  return (
    <div className={styles.filterContainer}>
      {/* 헤더 — 라벨 + 전체 해제 버튼 */}
      <div className={styles.filterHeader}>
        <span className={styles.filterLabel}>브랜드</span>
        {selectedBrand !== 'all' && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onBrandChange('all')}
          >
            전체 해제
          </button>
        )}
      </div>

      {/* 스크롤 래퍼 — 좌우 fade overlay로 스크롤 가능 영역임을 시각적으로 표시 */}
      <div className={styles.scrollWrapper}>
        {/* 왼쪽 fade overlay */}
        <div className={styles.fadeLeft} aria-hidden="true" />

        {/* 가로 스크롤 버튼 그룹 */}
        <div className={styles.buttonGroup}>
          {BRANDS.map((brand) => {
            // 선택 상태에 따라 스타일을 다르게 적용
            const isSelected = selectedBrand === brand.code;
            const buttonClassName = [
              styles.button,
              isSelected ? styles.selected : '',
              brand.comingSoon ? styles.buttonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ');

            // 버튼 내부 UI: 로고가 있으면 이미지, 없으면 이모지
            const buttonContent = (
              <>
                {brand.logo ? (
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
                ) : (
                  <span>{brand.emoji}</span>
                )}
                <span className={styles.brandName}>{brand.name}</span>
              </>
            );

            // 접근성: aria-pressed, aria-label 등을 통해 상태를 전달
            const button = (
              <button
                className={buttonClassName}
                onClick={() => handleBrandClick(brand.code as Brand | 'all', brand.comingSoon)}
                aria-pressed={isSelected}
                aria-label={`${brand.name} 필터${brand.comingSoon ? ' (곧 추가될 예정)' : ''}`}
                type="button"
                disabled={brand.comingSoon}
                aria-disabled={brand.comingSoon}
                title={brand.comingSoon ? '곧 추가될 예정이에요!' : undefined}
              >
                {buttonContent}
              </button>
            );

            // comingSoon 상태면 툴팁이 들어갈 wrapper를 사용
            const wrapperClass = brand.comingSoon ? styles.comingSoonWrapper : styles.buttonWrapper;

            return (
              <div key={brand.code} className={wrapperClass}>
                {button}
                {brand.comingSoon && (
                  <span className={styles.comingSoonTooltip} role="status" aria-live="polite">
                    곧 추가될 예정이에요!
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 오른쪽 fade overlay */}
        <div className={styles.fadeRight} aria-hidden="true" />
      </div>
    </div>
  );
}

export default BrandFilter;
