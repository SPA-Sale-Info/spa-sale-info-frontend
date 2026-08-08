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

  /**
   * indexNumber - 색인 번호 (Ledger 디자인 시스템 5번 규칙)
   *
   * 목록에서 이 항목이 몇 번째인지를 "01, 02, 03…" 형태로 보여줍니다.
   * 3,700여 건짜리 아카이브에서 "지금 어디쯤 보고 있는지"를 알려주고,
   * 상점이 아니라 색인이라는 화면의 성격을 드러내는 장치입니다.
   * 값이 없으면(찜 목록 등 순위가 의미 없는 화면) 번호를 렌더하지 않습니다.
   */
  indexNumber?: number;
}

/**
 * formatPrice - 숫자를 원화 기호 형식("₩12,900")으로 포맷합니다.
 * Framer 시안의 가격 표기(₩19,900)와 통일했습니다.
 * 숫자가 아니면 "가격 정보 없음"을 반환합니다.
 */
function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '가격 정보 없음';
  }
  return `₩${price.toLocaleString('ko-KR')}`;
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
  indexNumber,
}: ProductCardProps) {
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
   * 카드 진입 애니메이션 딜레이(인덱스 순서대로 등장)
   *
   * 무한 스크롤로 뒤늦게 붙는 카드까지 인덱스가 커지면 지연이 몇 초씩 쌓이므로,
   * 한 화면 분량(12개) 주기로 순환시켜 최대 지연을 660ms로 제한합니다.
   */
  const cardStyle = cardIndex !== undefined
    ? { animationDelay: `${(cardIndex % 12) * 55}ms` }
    : undefined;

  return (
    /*
     * ═══════════════════════════════════════════════════════════════
     * [접근성 수정] role="button" 제거 — "스트레치 링크" 패턴으로 전환
     * ═══════════════════════════════════════════════════════════════
     * 이전 구조:
     *   <article role="button" tabIndex={0} onClick={...} aria-label="...">
     *     <button 찜> <button 비교> <a 상품명> <a 외부링크>
     *   </article>
     *
     * 문제가 두 가지였습니다.
     * 1) 버튼 안에 버튼/링크를 넣는 것은 HTML·ARIA 규격 위반입니다.
     *    스크린리더는 바깥 요소를 "버튼 하나"로 읽으면서 내부 컨트롤도 따로 읽어,
     *    사용자에게 같은 카드가 중복·모순되게 전달됩니다.
     * 2) aria-label을 준 role="button"은 내부 텍스트를 덮어씁니다.
     *    즉 가격·할인율이 스크린리더에서 아예 안 읽혔습니다.
     *
     * 해결:
     * 상품명 링크(<a>)에 ::after로 카드 전체를 덮는 투명 레이어를 깔았습니다.
     * → 카드 아무 데나 눌러도 상세로 이동하는 "넓은 터치 영역"은 그대로 유지되고,
     *   Tab 포커스는 링크 하나로 정리되며, 접근성 트리는 정상적인
     *   "링크 + 버튼들"이 됩니다. 자바스크립트 라우팅도 필요 없어졌습니다.
     */
    <article
      className={`${styles.card} ${isSoldOut ? styles.cardSoldOut : ''}`}
      style={cardStyle}
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

        {/* Framer 시안: 할인율은 이미지 오버레이 배지가 아니라
            가격 행 옆의 레드 텍스트("-50%")로 표시합니다. → 아래 priceContainer 참고 */}

        {/* 품절 오버레이 — inStock === false일 때 이미지를 흐리게 + "품절" 표시 */}
        {isSoldOut && (
          <div className={styles.soldOutOverlay}>
            <span className={styles.soldOutLabel}>품절</span>
          </div>
        )}

        {/* 찜 버튼 — onFavoriteToggle이 전달된 경우에만 렌더
            카드 전체 onClick이 사라졌으므로 stopPropagation은 더 이상 필요 없습니다.
            대신 CSS에서 z-index로 스트레치 링크 레이어보다 위에 올려 클릭을 받습니다. */}
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

        {/* 비교 담기 토글 버튼 — onCompareToggle이 전달된 경우에만 렌더 */}
        {onCompareToggle && (
          <button
            type="button"
            className={`${styles.compareButton} ${isComparing ? styles.compareButtonActive : ''}`}
            // 비교함이 가득 찼고(disabled) 아직 담기지 않은 상품이면 클릭을 막습니다.
            disabled={compareDisabled && !isComparing}
            onClick={() => onCompareToggle(product)}
            aria-pressed={isComparing}
            aria-label={`${name} ${isComparing ? '비교함에서 빼기' : '비교함에 담기'}`}
            title={compareDisabled && !isComparing ? '비교함이 가득 찼어요 (최대 4개)' : '비교'}
          >
            {isComparing ? '비교중' : '비교'}
          </button>
        )}

        {/* Framer 시안: 바이브(무드) 태그는 이미지 오버레이가 아니라
            가격 아래의 보조 텍스트(.moodTag)로 표시합니다. → 아래 info 영역 참고 */}
      </div>

      {/* 상품 정보 영역 */}
      <div className={styles.info}>
        {/* ── 색인 행 ──
            [Ledger 재설계] 이전에는 브랜드명 옆에 알약 모양 성별 "배지"가 있었습니다.
            배지는 배경 도형을 하나 더 얹는 방식이라 항목마다 작은 상자가 반복돼
            목록 전체가 어수선해졌습니다.
            이제 색인 번호 · 브랜드 · 성별을 하나의 얇은 메타 줄로 묶고,
            도형 없이 글자 크기와 색만으로 위계를 만듭니다. */}
        <div className={styles.meta}>
          {indexNumber !== undefined && (
            <span className={styles.indexNumber} aria-hidden="true">
              {/* 두 자리로 0을 채워 세로로 자릿수가 맞습니다 (01, 02 … 12) */}
              {String(indexNumber).padStart(2, '0')}
            </span>
          )}
          <span className={styles.brandName}>{displayBrand}</span>
          {gender && (
            <span className={styles.genderNote}>{GENDER_LABEL[gender]}</span>
          )}
        </div>

        {/* 상품명 — 카드 전체를 덮는 "스트레치 링크"입니다(위 article 주석 참고).
            aria-label에 브랜드와 품절 여부를 함께 담아, 링크 목록만 훑는
            스크린리더 사용자도 어느 브랜드의 어떤 상품인지 알 수 있게 합니다. */}
        <h3 className={styles.productName}>
          {detailHref ? (
            <Link
              href={detailHref}
              className={styles.productNameLink}
              aria-label={`${displayBrand} ${name}${isSoldOut ? ' (품절)' : ''}`}
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>

        {/* 가격 영역: 할인가(굵게) + 원가(취소선) + 할인율(레드 텍스트)
            Framer 시안의 "₩19,900 ₩39,900 -50%" 한 줄 구성입니다. */}
        {/* [순서 변경] 할인가 → 할인율 → 원가
            이전 순서는 할인가 → 원가 → 할인율이었습니다.
            모바일 2열(카드 폭 약 165px)에서 세 값이 한 줄에 안 들어가면
            맨 뒤의 할인율만 다음 줄로 떨어져, 카드마다 높이가 들쭉날쭉했습니다.
            구매 판단의 핵심인 "얼마 / 몇 % 깎였나"를 붙여두고,
            상대적으로 덜 중요한 원가가 밀려나도록 순서를 바꿨습니다. */}
        <div className={styles.priceContainer}>
          <span className={styles.salePrice}>{formatPrice(effectiveSalePrice)}</span>
          {calculatedDiscountRate > 0 && (
            <span className={styles.discountRate} aria-label={`${calculatedDiscountRate}퍼센트 할인`}>
              -{calculatedDiscountRate}%
            </span>
          )}
          {showOriginalPrice && (
            <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
          )}
        </div>

        {/* 무드 태그 — 시안: 가격 아래 보조 텍스트 (예: "미니멀 · 시티 레이어드") */}
        {vibeTags && vibeTags.length > 0 && (
          <span className={styles.moodTag}>{vibeTags.slice(0, 2).join(' · ')}</span>
        )}

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
              aria-label={`${displayBrand} 공식 사이트에서 ${name} 보기 (새 창)`}
            >
              {/* 라벨을 "{브랜드}에서 보기"에서 "바로가기"로 줄였습니다.
                  카드가 좁아지면(그리드 5열 기준 약 215px) 왼쪽 업데이트 시각과 함께
                  한 줄에 들어가지 못해 글자가 잘렸습니다.
                  브랜드명은 바로 위 메타 행에 이미 있으므로 중복이기도 했습니다.
                  스크린리더에는 aria-label로 전체 맥락이 그대로 전달됩니다. */}
              바로가기 →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
