/**
 * ProductCard.js - 상품 카드 컴포넌트
 *
 * 개별 상품 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 이 컴포넌트가 받을 props:
 * - brand: 브랜드명
 * - name: 상품명
 * - originalPrice: 원가
 * - salePrice: 할인가
 * - discountRate: 할인율
 * - imageUrl: 상품 이미지 URL
 * - productUrl: 상품 상세 페이지 URL
 * - vibe: 감성 태그 (예: "AURALEE 맛")
 */

import { useMemo } from 'react'
// Next.js의 Image 컴포넌트를 import 합니다
// 일반 <img> 태그 대신 Next.js Image를 사용하는 이유:
// - 자동 이미지 최적화 (WebP 변환, 리사이징)
// - Lazy loading (스크롤할 때만 이미지 로드)
// - 성능 향상과 LCP(Largest Contentful Paint) 개선
// - 레이아웃 시프트 방지
import Image from 'next/image'
import styles from '../styles/ProductCard.module.css'
import { getSafeExternalUrl } from '../utils/url'

/**
 * 숫자를 한국 원화 형식으로 포맷하는 유틸리티 함수
 *
 * @param {number} price - 포맷할 가격
 * @returns {string} 포맷된 가격 문자열 (예: "29,900원")
 *
 * .toLocaleString() 메서드:
 * - 숫자를 지역 형식에 맞게 문자열로 변환
 * - 'ko-KR': 한국 형식 (쉼표 구분자)
 * - 예: 29900 -> "29,900"
 *
 * 템플릿 리터럴 (백틱):
 * - ${표현식}으로 변수나 함수 결과를 문자열에 삽입
 */
function formatPrice(price) {
  return `${price.toLocaleString('ko-KR')}원`
}

/**
 * 브랜드 코드를 표시용 이름으로 변환하는 함수
 *
 * @param {string} brandCode - 브랜드 코드
 * @returns {string} 표시용 브랜드 이름
 *
 * 객체를 맵(Map)처럼 사용:
 * - 브랜드 코드를 키로 사용
 * - 대괄호 표기법으로 값에 접근
 * - || 연산자로 기본값 제공 (맵에 없는 코드는 그대로 반환)
 */
function getBrandDisplayName(brandCode) {
  const brandNames = {
    'HM': 'H&M',
    'ZARA': 'ZARA',
    'UNIQLO': 'UNIQLO',
    'MUJI': 'MUJI',
  }

  /**
   * 대괄호 표기법 vs 점 표기법:
   * - brandNames[brandCode]: 변수로 속성 접근 ✅
   * - brandNames.brandCode: 'brandCode'라는 속성에 접근 (잘못됨) ❌
   *
   * 언제 대괄호 표기법을 사용하나요?
   * - 속성 이름이 변수에 저장되어 있을 때
   * - 속성 이름에 공백이나 특수문자가 있을 때
   * - 속성 이름이 동적으로 결정될 때
   */
  return brandNames[brandCode] || brandCode
}

function getGenderDisplayMeta(genderCode) {
  // 코드에서 바로 보기 어려우니, 화면에 보여줄 단어/이모지를 미리 정의합니다.
  const genderMap = {
    'men': { label: '남성', emoji: '👔' },
    'women': { label: '여성', emoji: '👗' },
    'unisex': { label: '공용', emoji: '🧥' },
  }

  return genderMap[genderCode] || null
}

/**
 * ProductCard 컴포넌트
 *
 * 구조 분해 할당으로 props를 받습니다
 */
function ProductCard({
  brand,
  gender,
  name,
  originalPrice,
  salePrice,
  discountRate,
  imageUrl,
  productUrl,
}) {
  // 사용자가 카드 전체를 클릭했을 때 이동할 수 있는 안전한 링크입니다.
  const safeProductUrl = useMemo(
    () => getSafeExternalUrl(productUrl),
    [productUrl],
  )
  const hasNavigableLink = Boolean(safeProductUrl)

  /**
   * 할인율 계산 (props로 받지 않은 경우를 대비)
   *
   * Math.round():
   * - 소수점 반올림
   * - 예: 33.33 -> 33
   *
   * 할인율 계산 공식:
   * - (원가 - 할인가) / 원가 * 100
   */
  const effectiveSalePrice = salePrice
  const showOriginalPrice = Boolean(originalPrice) && Boolean(effectiveSalePrice) && originalPrice !== effectiveSalePrice

  const calculatedDiscountRate = discountRate ||
    (showOriginalPrice
      ? Math.round(((originalPrice - effectiveSalePrice) / originalPrice) * 100)
      : 0)

  /**
   * 카드 클릭 핸들러
   *
   * window.open():
   * - 새 창/탭으로 URL을 엽니다
   * - 첫 번째 인자: URL
   * - 두 번째 인자: '_blank'는 새 탭에서 열기
   * - 세 번째 인자: 창 옵션 (noopener, noreferrer는 보안을 위함)
   *
   * 왜 noopener, noreferrer를 사용하나요?
   * - noopener: 새 창이 window.opener로 원본 페이지에 접근하는 것을 방지 (보안)
   * - noreferrer: HTTP Referer 헤더를 전송하지 않음 (프라이버시)
   */
  const handleCardClick = () => {
    if (!hasNavigableLink) {
      return
    }

    window.open(safeProductUrl, '_blank', 'noopener,noreferrer')
  }

  // 키보드(Enter, Space)로도 같은 동작을 하도록 처리합니다.
  const handleCardKeyDown = (event) => {
    if (!hasNavigableLink) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick()
    }
  }

  const genderMeta = getGenderDisplayMeta(gender)
  const genderClassKey = genderMeta
    ? `gender${gender.charAt(0).toUpperCase() + gender.slice(1)}`
    : ''

  /**
   * JSX 반환
   */
  return (
    /**
     * article 태그:
     * - 독립적인 콘텐츠를 나타내는 시맨틱 태그
     * - div 대신 article을 사용하면 의미론적으로 더 명확
     *
     * 시맨틱 HTML의 장점:
     * - SEO(검색 엔진 최적화)에 유리
     * - 접근성 향상
     * - 코드 가독성 증가
     */
    <article
      className={styles.card}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={hasNavigableLink ? 'link' : undefined}
      tabIndex={hasNavigableLink ? 0 : undefined}
    >
      {/**
       * 이미지 컨테이너
       *
       * position: relative를 사용하는 이유:
       * - Next.js Image 컴포넌트가 layout="fill"을 사용할 때 필요
       * - 부모 요소가 relative여야 자식의 absolute가 올바르게 작동
       */}
      <div className={styles.imageContainer}>
        {/**
         * Next.js Image 컴포넌트
         *
         * 주요 속성:
         * - src: 이미지 URL
         * - alt: 대체 텍스트 (이미지 로드 실패 시 또는 스크린 리더용)
         * - fill: 부모 요소의 가용 영역을 채움 (Next.js 13+)
         * - sizes: 반응형 레이아웃에서 예상되는 렌더링 폭을 브라우저에 전달
         */}
        <Image
          src={imageUrl}
          alt={`${getBrandDisplayName(brand)} - ${name}`}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 90vw, 320px"
        />
      </div>

      {/**
       * 상품 정보 영역
       */}
      <div className={styles.info}>
        {/**
         * 상품명
         *
         * h3 태그:
         * - 3번째 레벨 제목 (Heading)
         * - h1(가장 중요) ~ h6(가장 덜 중요)
         * - SEO와 접근성에 중요
         */}
        <h3 className={styles.productName}>
          {name}
        </h3>

        {/**
         * 가격 정보
         */}
        <div className={styles.priceContainer}>
          {/**
           * 원가 표시 (할인이 있을 때만)
           *
           * 조건부 렌더링:
           * - originalPrice와 salePrice가 다를 때만 원가 표시
           * - !== 연산자: 값이 다른지 비교
           */}
          {showOriginalPrice && (
            <div className={styles.originalPrice}>
              {formatPrice(originalPrice)}
            </div>
          )}

          {/**
           * 판매가 표시
           *
           * strong 태그:
           * - 텍스트를 강조 (의미론적으로 중요함을 나타냄)
           * - b 태그는 단순 굵게 (의미 없음)
           */}
          <div className={styles.salePrice}>
            <strong>{formatPrice(effectiveSalePrice)}</strong>
          </div>
        </div>
      </div>

      {/**
       * 카드 호버 효과 안내
       *
       * CSS로 hover 시 표시되는 요소
       */}
      <div className={styles.hoverOverlay}>
        <span>자세히 보기 →</span>
      </div>
    </article>
  )
}

/**
 * export default로 컴포넌트를 내보냅니다
 *
 * 이제 다른 파일에서 이렇게 사용할 수 있습니다:
 * import ProductCard from './ProductCard'
 */
export default ProductCard
