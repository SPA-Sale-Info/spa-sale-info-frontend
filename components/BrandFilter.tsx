/**
 * BrandFilter.tsx - 브랜드 필터 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 상단에 가로 스크롤 가능한 브랜드 버튼 목록을 렌더링합니다.
 * 버튼을 클릭하면 해당 브랜드의 상품만 필터링합니다.
 * comingSoon 브랜드는 비활성화되어 클릭 불가입니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 상태를 부모로 올리는 패턴 (Lifting State Up)
 * ═══════════════════════════════════════════════════════════════
 * 이 컴포넌트는 자체적으로 selectedBrand 상태를 갖지 않습니다.
 * 부모(index.tsx)가 상태를 관리하고 props로 내려줍니다.
 * 클릭 시 onBrandChange 콜백으로 부모에게 변경을 알립니다.
 * → GenderFilter, CategoryFilter와 동일한 패턴입니다.
 *
 * TypeScript 문법 포인트:
 * - interface: 객체 구조 정의
 * - Brand | 'all': 유니온 타입 (특정 브랜드 또는 '전체')
 * - string | null: 문자열 또는 null 유니온
 * - ?:optional 필드 (있어도 되고 없어도 됨)
 */

// Image: Next.js의 최적화된 이미지 컴포넌트
// 브랜드 로고(SVG) 이미지를 표시합니다.
import Image from 'next/image';

// 이 컴포넌트 전용 CSS 모듈
import styles from '../styles/BrandFilter.module.css';

import {
  ACTIVE_BRAND_CODES,
  BRAND_METADATA,
  NO_SALE_BRAND_CODES,
  PLANNED_BRAND_CODES,
} from '../types';

// import type: 타입 정보만 가져옵니다 (빌드된 JS에 포함 안 됨)
import type { Brand, BrandMetadata } from '../types';

/**
 * BrandItem - 브랜드 버튼 하나의 데이터 구조
 *
 * code: API에서 사용하는 브랜드 코드 (예: 'HM', 'ZARA')
 * name: 화면에 표시할 브랜드명 (예: 'H&M', 'ZARA')
 * logo?: 로고 이미지 경로 (선택, null이면 이모지 표시)
 *   string | null: 문자열 또는 null (없으면 이모지 사용)
 * emoji?: 로고 대신 표시할 이모지 (선택)
 * comingSoon?: 아직 지원하지 않는 브랜드 여부 (선택, 기본값: false)
 * noSale?: 현재 세일 없는 브랜드 여부 (선택)
 * bubblePosition?: 툴팁 위치 (선택, 'bottom' 등)
 *
 * 모든 ?필드는 TypeScript에서 undefined가 가능한 선택적 필드입니다.
 */
interface BrandItem extends Omit<BrandMetadata, 'code'> {
  code: Brand | 'all';
  emoji?: string;
  bubblePosition?: string;
}

/**
 * BrandFilterProps - 컴포넌트가 받는 props 구조
 *
 * selectedBrand: 현재 선택된 브랜드 코드 ('all' 또는 Brand 코드)
 * onBrandChange: 브랜드가 바뀔 때 부모에게 알리는 콜백
 */
interface BrandFilterProps {
  selectedBrand: Brand | 'all';
  onBrandChange: (brandCode: Brand | 'all') => void;
}

/**
 * BRANDS - 화면에 표시할 브랜드 목록 (정적 데이터)
 *
 * 컴포넌트 외부에 선언하는 이유:
 * 이 배열은 절대 변하지 않습니다.
 * 컴포넌트 내부에 선언하면 렌더링마다 새 배열이 생성됩니다 (낭비).
 * 외부에 선언하면 앱 시작 시 한 번만 생성됩니다.
 *
 * comingSoon: true인 브랜드는 버튼이 비활성화됩니다.
 * noSale: true인 브랜드는 현재 세일이 없는 상태입니다.
 */
const BRAND_ORDER: Brand[] = [
  ...ACTIVE_BRAND_CODES,
  ...NO_SALE_BRAND_CODES,
  ...PLANNED_BRAND_CODES,
];

const BRANDS: BrandItem[] = [
  { code: 'all', name: '전체', emoji: '🛍️', status: 'active' },
  ...BRAND_ORDER.map((code) => ({
    ...BRAND_METADATA[code],
    bubblePosition: code === 'MANGO' ? 'bottom' : undefined,
  })),
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
            const isComingSoon = brand.status === 'planned';
            const buttonClassName = [
              styles.button,
              isSelected ? styles.selected : '',
              isComingSoon ? styles.buttonDisabled : '',
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
                onClick={() => handleBrandClick(brand.code, isComingSoon)}
                aria-pressed={isSelected}
                aria-label={`${brand.name} 필터${isComingSoon ? ' (곧 추가될 예정)' : ''}`}
                type="button"
                disabled={isComingSoon}
                aria-disabled={isComingSoon}
                title={isComingSoon ? '곧 추가될 예정이에요!' : undefined}
              >
                {buttonContent}
              </button>
            );

            // comingSoon 상태면 툴팁이 들어갈 wrapper를 사용
            const wrapperClass = isComingSoon ? styles.comingSoonWrapper : styles.buttonWrapper;

            return (
              <div key={brand.code} className={wrapperClass}>
                {button}
                {isComingSoon && (
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
