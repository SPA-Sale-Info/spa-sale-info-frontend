/**
 * ProductCard.tsx - 상품 카드 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 상품 목록 화면에서 각 상품을 "카드" 형태로 보여주는 UI 컴포넌트입니다.
 * 상품 이미지, 브랜드명, 상품명, 원가(취소선), 할인가, 할인율, 품절 여부,
 * 업데이트 시각, 찜 버튼, 외부 브랜드 사이트 이동 버튼을 포함합니다.
 * 카드를 클릭하면 해당 상품의 상세 페이지(/product/[id])로 이동합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 왜 이렇게 많은 정보를 보여주나요? (이커머스 UX 관점)
 * ═══════════════════════════════════════════════════════════════
 * "여러 브랜드 세일을 한 곳에서 비교"하는 서비스이므로,
 * 사용자가 카드만 보고 "이건 어느 브랜드 / 원래 얼마였고 / 지금 얼마인지 /
 * 품절은 아닌지"를 판단할 수 있어야 클릭으로 이어집니다.
 * 데이터(brandName, originalPrice, inStock, updatedAt)는 이미 정규화 단계
 * (utils/productNormalization.ts)에서 채워지므로, 여기서는 "표시"만 합니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 접근성/SEO 개선 포인트 (이번 리팩터링)
 * ═══════════════════════════════════════════════════════════════
 * - 상품명을 next/link <Link>로 감싸 실제 href(<a>)를 갖게 했습니다.
 *   → 검색엔진이 링크를 인식하고, 사용자는 "새 탭으로 열기"가 가능합니다.
 * - 카드 전체 클릭(onClick)도 유지해 큰 터치 영역을 제공합니다(모바일 편의).
 * - 찜 버튼/외부링크 버튼은 stopPropagation으로 카드 클릭과 분리합니다.
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

import styles from '../styles/ProductCard.module.css';
import FavoriteButton from './FavoriteButton';
import { BRAND_METADATA } from '../types';

import type { Product, Brand, Gender } from '../types';

/**
 * ProductCardProps - 이 컴포넌트가 부모로부터 받는 props의 구조
 *
 * 부모(index.tsx)는 정규화된 상품 객체를 `{...product}`로 펼쳐 전달하므로,
 * 여기 선언한 필드들은 그 스프레드로 자동 채워집니다.
 */
interface ProductCardProps {
  product: Product;              // 상품 데이터 객체 (필수)
  brand: Brand;                  // 브랜드 코드 (필수) — 예: 'HM', 'ZARA'
  name: string;                  // 상품명 (필수)
  originalPrice?: number;        // 원가 (선택 — 있으면 취소선으로 표시)
  salePrice: number;             // 할인가 (필수)
  discountRate?: number;         // 할인율 (선택 — 없으면 직접 계산)
  imageUrl: string;              // 상품 이미지 URL (필수)
  brandName?: string;            // 표시용 브랜드명 (선택 — 없으면 코드로 변환)
  gender?: Gender;               // 성별 (선택 — 카드 상단 배지)
  inStock?: boolean;             // 재고 여부 (false면 품절 처리)
  productUrl?: string;           // 외부 브랜드 사이트 상품 링크 (CTA 버튼)
  updatedAt?: string;            // 데이터 갱신 시각 (신선도 표시)
  isFavorite?: boolean;          // 현재 찜 상태 (선택, 기본값: false)
  onFavoriteToggle?: (product: Product) => void; // 찜 토글 콜백 (선택)
  isComparing?: boolean;         // 비교함에 담겨 있는지 (선택)
  onCompareToggle?: (product: Product) => void;  // 비교 담기/빼기 콜백 (선택)
  compareDisabled?: boolean;     // 비교함이 가득 차서 더 담을 수 없을 때 true
  cardIndex?: number;            // 진입 애니메이션 순서용 인덱스
  vibeTags?: string[];           // 이미지 위 오버레이 바이브 태그 (예: ['AURALEE 맛'])
}

/**
 * formatPrice - 숫자를 한국 원화 형식("12,900원")으로 포맷합니다.
 * 숫자가 아니면 "가격 정보 없음"을 반환합니다.
 */
function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '가격 정보 없음';
  }
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * getBrandDisplayName - 브랜드 코드를 표시용 이름으로 변환합니다.
 * 예: 'HM' → 'H&M'. 매핑에 없으면 코드를 그대로 반환합니다.
 */
function getBrandDisplayName(brandCode: Brand): string {
  return BRAND_METADATA[brandCode]?.name || brandCode;
}

/**
 * GENDER_LABEL - 성별 코드를 짧은 한글 라벨로 변환하는 매핑입니다.
 * 카드 상단의 작은 배지에 사용합니다. (색상만으로 구분하지 않도록 텍스트도 함께 노출)
 */
const GENDER_LABEL: Record<Gender, string> = {
  MAN: '남성',
  WOMAN: '여성',
  UNISEX: '공용',
};

/**
 * formatRelativeTime - ISO 날짜 문자열을 "N시간 전 / N일 전" 형식으로 변환합니다.
 *
 * @param iso - "2024-06-19T10:30:00Z" 같은 ISO 8601 문자열 (없을 수 있음)
 * @returns 사람이 읽기 쉬운 상대 시간 문자열, 변환 불가하면 null
 *
 * 왜 상대 시간인가요?
 * "방금/N시간 전 업데이트"는 크롤링 서비스의 "신선도(데이터가 최신임)"를
 * 직관적으로 전달해, 단순 목록이 아니라 살아있는 서비스로 보이게 합니다.
 */
function formatRelativeTime(iso?: string): string | null {
  if (!iso) {
    return null;
  }

  const time = new Date(iso).getTime();
  // 유효하지 않은 날짜면(NaN) 표시하지 않습니다.
  if (Number.isNaN(time)) {
    return null;
  }

  const diffMs = Date.now() - time;
  if (diffMs < 0) {
    return null; // 미래 시각이면 표시하지 않음(데이터 오류 방어)
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return '방금 업데이트';
  if (diffMinutes < 60) return `${diffMinutes}분 전 업데이트`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전 업데이트`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}일 전 업데이트`;

  return null; // 30일 이상이면 굳이 표시하지 않습니다.
}

/**
 * ProductCard 컴포넌트 - 상품 카드 UI
 */
function ProductCard({
  product,
  brand,
  name,
  originalPrice,
  salePrice,
  discountRate,
  imageUrl,
  brandName,
  gender,
  inStock,
  productUrl,
  updatedAt,
  isFavorite = false,
  onFavoriteToggle,
  isComparing = false,
  onCompareToggle,
  compareDisabled = false,
  cardIndex,
  vibeTags,
}: ProductCardProps) {
  const router = useRouter();

  /**
   * 원가 표시 여부 결정
   * - 원가가 존재하고(0 아님), 할인가도 존재하며, 둘이 다를 때만 취소선 원가를 보여줍니다.
   * - 원가 == 할인가(할인 없음)이면 취소선이 의미 없으므로 숨깁니다.
   */
  const effectiveSalePrice = salePrice;
  const showOriginalPrice =
    Boolean(originalPrice) && Boolean(effectiveSalePrice) && originalPrice !== effectiveSalePrice;

  /**
   * 할인율 계산
   * discountRate가 있으면 그대로 사용하고, 없으면 원가/할인가로 직접 계산합니다.
   */
  const calculatedDiscountRate =
    discountRate ||
    (showOriginalPrice ? Math.round(((originalPrice! - effectiveSalePrice) / originalPrice!) * 100) : 0);

  // 품절 여부: inStock이 명시적으로 false일 때만 품절로 취급합니다.
  // (undefined이면 재고 정보 없음 → 정상 상품처럼 표시)
  const isSoldOut = inStock === false;

  // 표시용 브랜드명: 정규화된 brandName 우선, 없으면 코드 변환
  const displayBrand = brandName || getBrandDisplayName(brand);

  // 상대 시간 문자열(없으면 null → 미표시)
  const updatedLabel = formatRelativeTime(updatedAt);

  // 외부 사이트로 이동 가능한지(유효한 productUrl인지)
  const hasExternalLink = Boolean(productUrl) && productUrl !== '#';

  // 상세 페이지 경로 (Link href와 카드 클릭 모두에서 사용)
  const detailHref = product?.id ? `/product/${product.id}` : '';

  /**
   * 카드 클릭 핸들러 — 상세 페이지로 이동(큰 터치 영역 제공)
   * 상품명 <Link>는 자체 href로 이동하므로, 여기서는 카드 여백 클릭을 처리합니다.
   */
  const handleCardClick = () => {
    if (!detailHref) {
      return;
    }
    router.push(detailHref);
  };

  /**
   * 키보드 접근성 — Enter/Space로 카드 "클릭"을 수행합니다.
   */
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!detailHref) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  // 카드 진입 애니메이션 딜레이(인덱스 순서대로 등장)
  const cardStyle = cardIndex !== undefined
    ? { animationDelay: `${cardIndex * 60}ms` }
    : undefined;

  return (
    <article
      className={`${styles.card} ${isSoldOut ? styles.cardSoldOut : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      style={cardStyle}
      aria-label={`${displayBrand} ${name}${isSoldOut ? ' (품절)' : ''}`}
    >
      {/* 이미지 영역 */}
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={`${displayBrand} - ${name}`}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 90vw, 320px"
        />

        {/* 할인율 배지 — 이미지 좌상단 (가장 강조하고 싶은 정보) */}
        {calculatedDiscountRate > 0 && (
          <div className={styles.discountBadgeOverlay}>{calculatedDiscountRate}% OFF</div>
        )}

        {/* 품절 오버레이 — inStock === false일 때 이미지를 흐리게 + "품절" 표시 */}
        {isSoldOut && (
          <div className={styles.soldOutOverlay}>
            <span className={styles.soldOutLabel}>품절</span>
          </div>
        )}

        {/* 찜 버튼 — onFavoriteToggle이 전달된 경우에만 렌더 */}
        {onFavoriteToggle && (
          <div
            className={styles.favoriteButtonWrapper}
            // 찜 버튼 영역 클릭이 카드 클릭(상세 이동)으로 번지지 않게 막습니다.
            onClick={(e) => e.stopPropagation()}
          >
            <FavoriteButton
              product={product}
              isFavorite={isFavorite}
              onToggle={onFavoriteToggle}
              size="medium"
            />
          </div>
        )}

        {/* 비교 담기 토글 버튼 — onCompareToggle이 전달된 경우에만 렌더 */}
        {onCompareToggle && (
          <button
            type="button"
            className={`${styles.compareButton} ${isComparing ? styles.compareButtonActive : ''}`}
            // 비교함이 가득 찼고(disabled) 아직 담기지 않은 상품이면 클릭을 막습니다.
            disabled={compareDisabled && !isComparing}
            onClick={(e) => {
              e.stopPropagation() // 카드 클릭(상세 이동)으로 번지지 않게 차단
              onCompareToggle(product)
            }}
            aria-pressed={isComparing}
            aria-label={isComparing ? '비교함에서 빼기' : '비교함에 담기'}
            title={compareDisabled && !isComparing ? '비교함이 가득 찼어요 (최대 4개)' : '비교'}
          >
            {isComparing ? '✓ 비교중' : '⇄ 비교'}
          </button>
        )}

        {/* 바이브 태그 오버레이 — 최대 2개 */}
        {vibeTags && vibeTags.length > 0 && (
          <div className={styles.vibeTagsOverlay}>
            {vibeTags.slice(0, 2).map(tag => (
              <span key={tag} className={styles.vibeTagOverlay}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 상품 정보 영역 */}
      <div className={styles.info}>
        {/* 메타 행: 브랜드명 + 성별 배지 */}
        <div className={styles.meta}>
          <span className={styles.brandName}>{displayBrand}</span>
          {gender && (
            <span
              className={`${styles.genderBadge} ${
                gender === 'MAN' ? styles.genderMen
                  : gender === 'WOMAN' ? styles.genderWomen
                    : styles.genderUnisex
              }`}
            >
              {GENDER_LABEL[gender]}
            </span>
          )}
        </div>

        {/* 상품명 — 실제 링크(<a>)로 만들어 href/SEO/새 탭 열기를 지원 */}
        <h3 className={styles.productName}>
          {detailHref ? (
            <Link href={detailHref} className={styles.productNameLink}>
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>

        {/* 가격 영역: 할인가(강조) + 원가(취소선) */}
        <div className={styles.priceContainer}>
          <span className={styles.salePrice}>{formatPrice(effectiveSalePrice)}</span>
          {showOriginalPrice && (
            <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
          )}
        </div>

        {/* 하단 행: 업데이트 시각 + 외부 사이트 이동 CTA */}
        <div className={styles.cardFooter}>
          {updatedLabel && (
            <span className={styles.updatedAt}>{updatedLabel}</span>
          )}

          {hasExternalLink && (
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={styles.externalCta}
              // 외부 링크 클릭이 카드 클릭(내부 상세 이동)으로 번지지 않게 막습니다.
              onClick={(e) => e.stopPropagation()}
              aria-label={`${displayBrand} 공식 사이트에서 ${name} 보기 (새 창)`}
            >
              {displayBrand}에서 보기 →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
