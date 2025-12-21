/**
 * ProductCard.tsx - 상품 카드 컴포넌트 (TypeScript 버전)
 */

import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/ProductCard.module.css';
import FavoriteButton from './FavoriteButton';
import type { Product, Brand } from '../types';

// 컴포넌트 Props 타입 정의
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
}

/**
 * 숫자를 한국 원화 형식으로 포맷
 */
function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 브랜드 코드를 표시용 이름으로 변환
 */
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
}: ProductCardProps) {
  const router = useRouter();

  const effectiveSalePrice = salePrice;
  const showOriginalPrice =
    Boolean(originalPrice) && Boolean(effectiveSalePrice) && originalPrice !== effectiveSalePrice;

  const calculatedDiscountRate =
    discountRate ||
    (showOriginalPrice ? Math.round(((originalPrice! - effectiveSalePrice) / originalPrice!) * 100) : 0);

  /**
   * 카드 클릭 핸들러
   */
  const handleCardClick = () => {
    if (!product || !product.id) {
      return;
    }
    router.push(`/product/${product.id}`);
  };

  /**
   * 키보드 이벤트 핸들러
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

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
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
