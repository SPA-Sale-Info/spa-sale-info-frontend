/**
 * ProductCard.tsx - 상품 카드 컴포넌트 (TypeScript 버전)
 *
 * 상품 리스트에서 보이는 카드 UI를 담당합니다.
 * TypeScript 문법 포인트:
 * - interface로 props 구조를 정의합니다.
 * - optional(?)은 있어도 되고 없어도 되는 값입니다.
 */

import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/ProductCard.module.css';
import FavoriteButton from './FavoriteButton';
import type { Product, Brand } from '../types';

// 컴포넌트 Props 타입 정의
// 컴포넌트에 전달되는 props 타입
interface ProductCardProps {
  product: Product;
  brand: Brand;
  name: string;
  originalPrice?: number;
  salePrice: number;
  discountRate?: number;
  imageUrl: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (product: Product) => void;
  // v4 추가: 카드 스태거 delay용 인덱스 (index * 60ms)
  cardIndex?: number;
  // v4 추가: 이미지 위 오버레이로 표시할 vibe 태그 배열
  vibeTags?: string[];
}

/**
 * 숫자를 한국 원화 형식으로 포맷
 */
// 가격 표시용 포맷 함수
function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '가격 정보 없음';
  }

  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 브랜드 코드를 표시용 이름으로 변환
 */
// 브랜드 코드 -> 표시용 브랜드명 변환
function getBrandDisplayName(brandCode: Brand): string {
  const brandNames: Record<Brand, string> = {
    HM: 'H&M',
    ZARA: 'ZARA',
    UNIQLO: 'UNIQLO',
    MUJI: 'MUJI',
    CHARLESKEITH: 'Charles & Keith',
  };

  return brandNames[brandCode] || brandCode;
}

/**
 * ProductCard 컴포넌트
 */
function ProductCard({
  product,
  brand,
  name,
  originalPrice,
  salePrice,
  discountRate,
  imageUrl,
  isFavorite = false,
  onFavoriteToggle,
  cardIndex,
  vibeTags,
}: ProductCardProps) {
  const router = useRouter();

  // 실제로 표시할 가격 (현재는 salePrice를 그대로 사용)
  const effectiveSalePrice = salePrice;
  const showOriginalPrice =
    Boolean(originalPrice) && Boolean(effectiveSalePrice) && originalPrice !== effectiveSalePrice;

  // 할인율 계산 (props로 할인율이 없으면 직접 계산)
  const calculatedDiscountRate =
    discountRate ||
    (showOriginalPrice ? Math.round(((originalPrice! - effectiveSalePrice) / originalPrice!) * 100) : 0);

  /**
   * 카드 클릭 핸들러
   * - 상품 상세 페이지로 이동
   */
  const handleCardClick = () => {
    if (!product || !product.id) {
      return;
    }
    router.push(`/product/${product.id}`);
  };

  /**
   * 키보드 이벤트 핸들러
   * - Enter/Space 키로도 카드 클릭 동작을 하도록 접근성 개선
   */
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!product || !product.id) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  // v4: cardIndex * 60ms 스태거 delay — 카드들이 순서대로 진입합니다.
  const cardStyle = cardIndex !== undefined
    ? { animationDelay: `${cardIndex * 60}ms` }
    : undefined;

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      style={cardStyle}
    >
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={`${getBrandDisplayName(brand)} - ${name}`}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 90vw, 320px"
        />

        {onFavoriteToggle && (
          <div className={styles.favoriteButtonWrapper}>
            <FavoriteButton
              product={product}
              isFavorite={isFavorite}
              onToggle={onFavoriteToggle}
              size="medium"
            />
          </div>
        )}

        {/* v4: vibe 태그 오버레이 — 이미지 위 하단에 glassmorphism pill로 표시 */}
        {vibeTags && vibeTags.length > 0 && (
          <div className={styles.vibeTagsOverlay}>
            {vibeTags.slice(0, 2).map(tag => (
              <span key={tag} className={styles.vibeTagOverlay}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.productName}>{name}</h3>

        <div className={styles.priceContainer}>
          {calculatedDiscountRate > 0 && (
            <div className={styles.discountBadge}>{calculatedDiscountRate}% OFF</div>
          )}

          <div className={styles.salePrice}>
            <strong>{formatPrice(effectiveSalePrice)}</strong>
          </div>
        </div>
      </div>

      <div className={styles.hoverOverlay}>
        <span>상세 정보 보기 →</span>
      </div>
    </article>
  );
}

export default ProductCard;
