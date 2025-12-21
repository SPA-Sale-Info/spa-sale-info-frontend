/**
 * BrandFilter.tsx - 브랜드 필터 컴포넌트 (TypeScript 버전)
 */

import Image from 'next/image';
import styles from '../styles/BrandFilter.module.css';
import type { Brand } from '../types';

interface BrandItem {
  code: string;
  name: string;
  logo?: string | null;
  emoji?: string;
  comingSoon?: boolean;
  noSale?: boolean;
  bubblePosition?: string;
}

interface BrandFilterProps {
  selectedBrand: Brand | 'all';
  onBrandChange: (brandCode: Brand | 'all') => void;
}

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
  const handleBrandClick = (brandCode: Brand | 'all', isDisabled?: boolean) => {
    if (isDisabled) {
      return;
    }
    onBrandChange(brandCode);
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.buttonGroup}>
        {BRANDS.map((brand) => {
          const isSelected = selectedBrand === brand.code;
          const buttonClassName = [
            styles.button,
            isSelected ? styles.selected : '',
            brand.comingSoon ? styles.buttonDisabled : '',
          ]
            .filter(Boolean)
            .join(' ');

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
    </div>
  );
}

export default BrandFilter;
