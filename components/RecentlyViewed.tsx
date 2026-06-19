/**
 * RecentlyViewed.tsx - 최근 본 상품 목록 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 사용자가 최근에 본 상품들을 가로 스크롤 카드 목록으로 표시합니다.
 * useRecentlyViewed 훅에서 가져온 products 배열을 받아 렌더링합니다.
 * 각 카드를 클릭하면 해당 상품의 상세 페이지(/product/[id])로 이동합니다.
 * 상품이 없으면 null을 반환하여 UI에 아무것도 표시하지 않습니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * 이 컴포넌트의 역할 분리
 * ═══════════════════════════════════════════════════════════════
 * 이 컴포넌트는 순수하게 "표시(Presentation)"만 담당합니다.
 * 데이터 로딩, localStorage 접근, 상품 추가 등은 useRecentlyViewed 훅이 처리합니다.
 * → 관심사 분리(Separation of Concerns) 원칙을 따릅니다.
 * Java 비유: 이 컴포넌트는 View(JSP), useRecentlyViewed 훅은 Service 레이어입니다.
 *
 * ═══════════════════════════════════════════════════════════════
 * TypeScript 문법 포인트
 * ═══════════════════════════════════════════════════════════════
 * - interface: 컴포넌트 props와 데이터 구조를 정의합니다.
 * - number | null | undefined: 세 가지 타입을 허용하는 유니온 타입
 * - typeof price !== 'number': 런타임 타입 검사
 * - Number.isNaN(): 값이 NaN(숫자가 아닌 숫자)인지 검사
 * - product.discountRate && product.discountRate > 0: 선택적 필드의 안전한 사용
 */

// Link: Next.js의 클라이언트 사이드 네비게이션 컴포넌트
// 일반 <a> 태그와 달리 페이지 전체를 새로 불러오지 않고, JavaScript로 URL을 변경합니다.
// → 빠른 페이지 전환 (SPA 방식)
import Link from 'next/link';

// Image: Next.js의 최적화된 이미지 컴포넌트
// 자동 lazy loading, WebP 변환, 크기 최적화 등을 제공합니다.
import Image from 'next/image';

// 이 컴포넌트 전용 CSS 모듈
import styles from '../styles/RecentlyViewed.module.css';

/**
 * RecentlyViewedProduct - 최근 본 상품 카드 하나의 데이터 구조
 *
 * useRecentlyViewed 훅의 RecentlyViewedItem과 유사하지만,
 * 이 컴포넌트에서 실제로 표시하는 필드만 정의합니다.
 * → 인터페이스를 컴포넌트 필요에 맞게 별도로 정의하는 것이 좋은 습관입니다.
 *   (불필요한 필드에 대한 의존성을 줄입니다)
 *
 * id: 상품 고유 식별자 (문자열) — `/product/${id}` URL 생성에 사용
 * name: 상품명 — 카드에 표시, Image의 alt 텍스트로도 사용
 * brand: 브랜드 코드 (예: 'HM', 'ZARA') — 카드에 표시
 * salePrice: 할인가 — formatPrice()로 포맷하여 표시
 * imageUrl: 상품 이미지 URL — Next.js Image 컴포넌트에 전달
 * discountRate?: 할인율 (선택) — 0 초과 시 배지로 표시
 *   ?: optional 필드 — undefined 허용, 없는 상품도 있을 수 있습니다.
 */
interface RecentlyViewedProduct {
  id: string;
  name: string;
  brand: string;
  salePrice: number;
  imageUrl: string;
  discountRate?: number;
}

/**
 * RecentlyViewedProps - 부모 컴포넌트(index.tsx 등)가 전달하는 props 구조
 *
 * products: 최근 본 상품 배열
 * → useRecentlyViewed 훅의 recentItems를 그대로 전달합니다.
 * → 배열이 비어있으면 컴포넌트가 null을 반환하여 아무것도 표시되지 않습니다.
 */
interface RecentlyViewedProps {
  products: RecentlyViewedProduct[];
}

/**
 * RecentlyViewed 컴포넌트
 *
 * export default: 기본 내보내기 — import RecentlyViewed from './RecentlyViewed'로 가져옵니다.
 *
 * 사용 예시 (index.tsx):
 * const { recentItems } = useRecentlyViewed();
 * <RecentlyViewed products={recentItems} />
 */
export default function RecentlyViewed({ products }: RecentlyViewedProps) {
  /**
   * 조기 반환(Early Return) 패턴:
   * 표시할 상품이 없으면 null을 반환합니다.
   *
   * !products: products가 null이나 undefined인 경우 (방어 코드)
   * products.length === 0: 배열이 비어있는 경우
   *
   * null 반환:
   * React에서 null을 반환하면 아무것도 렌더링되지 않습니다.
   * 조건부 렌더링의 가장 간단한 방법입니다.
   * Java 비유: if (products == null || products.isEmpty()) { return; } // 아무것도 출력 안 함
   */
  if (!products || products.length === 0) return null;

  /**
   * formatPrice - 가격을 화면에 표시할 문자열로 변환하는 함수
   *
   * price: number | null | undefined
   * - number: 정상적인 숫자 가격 (예: 29900)
   * - null: 명시적으로 없는 값 (예: API에서 null을 반환한 경우)
   * - undefined: 값이 전달되지 않은 경우 (optional 필드)
   *
   * typeof price !== 'number':
   * - typeof 연산자: 값의 타입을 문자열로 반환합니다.
   *   예: typeof 123 → 'number', typeof 'hello' → 'string', typeof null → 'object'
   * - null도 typeof null === 'object'이므로 이 검사에서 걸러집니다.
   * Java 비유: !(price instanceof Number)
   *
   * Number.isNaN(price):
   * - NaN(Not a Number): JavaScript에서 숫자가 아닌 값(0/0, parseInt('abc') 등)
   * - Number.isNaN()은 엄격하게 NaN만 검사합니다 (전역 isNaN()은 타입 변환 포함)
   * Java 비유: Double.isNaN(price)
   *
   * price.toLocaleString('ko-KR'):
   * - 숫자를 한국 형식(쉼표 구분)의 문자열로 변환합니다.
   * - 예: 29900 → '29,900'
   * - 'ko-KR': 한국어(대한민국) 로케일 설정
   * Java 비유: String.format("%,d", price) 또는 NumberFormat.getInstance(Locale.KOREA).format(price)
   */
  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return '가격 정보 없음';
    }
    return `${price.toLocaleString('ko-KR')}원`;
  };

  /**
   * JSX 반환 — 최근 본 상품 섹션 UI
   *
   * <section>: HTML5 시맨틱 요소 — 관련 콘텐츠 섹션을 그룹화합니다.
   *   스크린 리더가 이 영역을 섹션으로 인식합니다.
   *   Java 비유: HTML5 구조화 요소 사용은 접근성을 위한 모범 사례입니다.
   *
   * className={styles.container}: CSS 모듈 클래스 적용
   *   styles.container → 실제 CSS: 'RecentlyViewed_container__xxxx'로 변환됩니다.
   */
  return (
    <section className={styles.container}>
      {/**
       * <h3>: 섹션 제목 — "최근 본 상품"
       * h1 > h2 > h3의 계층 구조를 따릅니다.
       * 페이지의 제목(h1), 주요 섹션(h2), 하위 섹션(h3) 순으로 씁니다.
       * SEO와 접근성 모두에 중요한 요소입니다.
       */}
      <h3 className={styles.title}>최근 본 상품</h3>

      {/**
       * 가로 스크롤 영역 — 상품 카드들을 가로로 스크롤할 수 있는 컨테이너
       * CSS에서 overflow-x: auto로 가로 스크롤을 활성화합니다.
       */}
      <div className={styles.scrollArea}>
        <div className={styles.list}>
          {/**
           * products 배열을 .map()으로 순회하여 각 상품 카드를 렌더링합니다.
           *
           * .map((product) => ...):
           * - 각 RecentlyViewedProduct 객체를 JSX <Link> 요소로 변환합니다.
           * Java 비유: products.stream().map(product -> renderCard(product)).collect(toList())
           *
           * key={product.id}: React가 각 항목을 고유하게 식별하기 위한 필수 속성
           * 목록이 업데이트될 때 어떤 항목이 추가/제거/수정됐는지 효율적으로 파악합니다.
           */}
          {products.map((product) => (
            /**
             * Link: Next.js 클라이언트 사이드 네비게이션
             *
             * href={`/product/${product.id}`}:
             * - 템플릿 리터럴로 동적 URL을 생성합니다.
             * - 예: product.id = '123' → href = '/product/123'
             * - pages/product/[id].tsx 파일이 이 URL을 처리합니다.
             *   Next.js 파일 기반 라우팅: [id]가 동적 세그먼트입니다.
             *
             * key={product.id}: .map() 내에서 각 요소의 고유 식별자
             *
             * className={styles.card}: 카드 스타일 적용
             */
            <Link href={`/product/${product.id}`} key={product.id} className={styles.card}>
              {/**
               * 이미지 컨테이너 — 상대적 위치를 위한 래퍼
               * Next.js Image에서 fill 모드를 사용할 때 부모 요소에 position: relative가 필요합니다.
               * CSS에서 styles.imageWrapper에 position: relative를 설정합니다.
               */}
              <div className={styles.imageWrapper}>
                {/**
                 * Next.js Image 컴포넌트 — 최적화된 이미지 렌더링
                 *
                 * src={product.imageUrl}: 이미지 URL (외부 도메인은 next.config.js에 등록 필요)
                 * alt={product.name}: 접근성 — 이미지 내용을 설명하는 텍스트
                 *   이미지가 로드 실패하거나 스크린 리더 사용 시 이 텍스트가 사용됩니다.
                 *
                 * fill: 부모 컨테이너를 가득 채우는 모드
                 *   - 부모 요소가 position: relative여야 합니다.
                 *   - width/height 대신 CSS로 크기를 제어합니다.
                 *   - 이미지가 컨테이너 크기에 맞게 자동 조정됩니다.
                 *
                 * sizes="120px": 이 이미지가 화면에서 차지하는 최대 크기
                 *   브라우저가 적절한 해상도의 이미지를 선택하는 데 사용합니다.
                 *   모바일(120px 너비)에서도 선명하게 보이도록 최적화됩니다.
                 */}
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className={styles.image}
                  sizes="120px"
                />

                {/**
                 * 할인율 배지 — 할인율이 0보다 클 때만 표시합니다.
                 *
                 * product.discountRate && product.discountRate > 0:
                 * - product.discountRate: optional 필드라 undefined일 수 있습니다.
                 *   undefined는 falsy이므로 &&의 왼쪽이 false가 되어 뒤가 실행되지 않습니다.
                 * - product.discountRate > 0: 0%는 "할인 없음"이므로 배지를 표시하지 않습니다.
                 *
                 * 단축 회로 평가(Short-circuit Evaluation):
                 * - A && B: A가 falsy이면 B를 실행하지 않습니다.
                 * - React에서 조건부 렌더링에 자주 사용합니다.
                 * Java 비유: if (product.discountRate != null && product.discountRate > 0) { ... }
                 */}
                {product.discountRate && product.discountRate > 0 && (
                  <span className={styles.discountBadge}>{product.discountRate}%</span>
                )}
              </div>

              {/**
               * 상품 정보 영역 — 브랜드, 상품명, 가격
               */}
              <div className={styles.info}>
                {/* 브랜드 코드 표시 (예: 'HM', 'ZARA') */}
                <div className={styles.brand}>{product.brand}</div>

                {/* 상품명 — 긴 이름은 CSS로 truncate 처리 */}
                <div className={styles.name}>{product.name}</div>

                {/**
                 * 할인가 표시 — formatPrice() 함수로 포맷합니다.
                 * 예: 29900 → '29,900원'
                 * 숫자가 유효하지 않으면 '가격 정보 없음'이 표시됩니다.
                 */}
                <div className={styles.price}>{formatPrice(product.salePrice)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
