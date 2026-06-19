/**
 * FavoriteButton.tsx - 찜하기 하트 버튼 컴포넌트 (TypeScript 버전)
 *
 * ═══════════════════════════════════════════════════════════════
 * 📌 이 파일이 하는 일
 * ═══════════════════════════════════════════════════════════════
 * 상품 카드 위에 표시되는 하트(♥) 버튼입니다.
 * 클릭하면 찜 상태가 토글(추가 ↔ 제거)됩니다.
 * 찜 상태에 따라 아이콘 색상이 달라집니다 (채워진 빨간 하트 / 빈 하트).
 *
 * ═══════════════════════════════════════════════════════════════
 * 이벤트 버블링(Event Bubbling)이란?
 * ═══════════════════════════════════════════════════════════════
 * HTML에서 자식 요소의 이벤트가 부모 요소로 "버블링(전파)"됩니다.
 * 예: 카드(<article>) 안의 버튼(<button>)을 클릭하면
 *   → 버튼의 onClick 실행 → 카드의 onClick도 실행됩니다.
 *
 * 이 컴포넌트에서는 찜 버튼 클릭이 카드 클릭(상세 페이지 이동)으로 전파되지 않도록
 * e.stopPropagation()으로 버블링을 막습니다.
 *
 * Java 비유: 이벤트 리스너에서 event.consume()으로 이벤트 전파를 막는 것과 유사합니다.
 *
 * TypeScript 문법 포인트:
 * - type 별칭으로 허용 값 제한: type ButtonSize = 'small' | 'medium' | 'large'
 * - interface props: 컴포넌트 입력값의 구조와 타입 정의
 * - React.MouseEvent<HTMLButtonElement>: 마우스 클릭 이벤트의 TypeScript 타입
 */

// React: 이 파일에서 JSX를 사용하기 위해 React를 import합니다.
// (React 17 이후 자동 import되지만 명시적으로 쓰는 것이 좋습니다)
import React from 'react';

// CSS 모듈: 이 컴포넌트 전용 스타일
import styles from '../styles/FavoriteButton.module.css';

// import type: 타입 정보만 가져옵니다 (빌드된 JS에 포함 안 됨)
import type { Product } from '../types';

/**
 * ButtonSize - 버튼 크기를 제한하는 타입
 *
 * type 별칭 + 유니온(|):
 * "ButtonSize는 이 3가지 문자열 중 하나여야 한다"는 규칙입니다.
 * 다른 문자열(예: 'huge')을 전달하면 TypeScript 컴파일 에러가 발생합니다.
 *
 * Java 비유: public enum ButtonSize { SMALL, MEDIUM, LARGE }
 */
type ButtonSize = 'small' | 'medium' | 'large';

/**
 * FavoriteButtonProps - 이 컴포넌트가 받는 props의 구조
 *
 * product: 찜할 상품 정보 (toggleFavorite에 전달할 데이터)
 * isFavorite: 현재 찜 상태 (true = 이미 찜, false = 찜 안 함)
 * onToggle: 찜 버튼 클릭 시 호출할 콜백 함수
 *   (product: Product) => void: Product를 받고 반환값 없는 함수 타입
 *   Java 비유: Consumer<Product>
 * size?: 버튼 크기 (선택 — 기본값: 'medium')
 *   ?: optional 필드, 부모가 전달하지 않으면 undefined
 */
interface FavoriteButtonProps {
  product: Product;
  isFavorite: boolean;
  onToggle: (product: Product) => void;
  size?: ButtonSize;
}

/**
 * FavoriteButton 컴포넌트
 *
 * 구조 분해 할당으로 props를 받습니다:
 * { product, isFavorite, onToggle, size = 'medium' }
 * - size = 'medium': size prop이 전달되지 않으면 'medium'을 기본값으로 사용합니다.
 *
 * Java 비유:
 * public void render(Product product, boolean isFavorite, Consumer<Product> onToggle,
 *                    String size) {
 *   if (size == null) size = "medium"; // 기본값
 * }
 */
function FavoriteButton({ product, isFavorite, onToggle, size = 'medium' }: FavoriteButtonProps) {
  /**
   * handleClick - 클릭 이벤트 핸들러
   *
   * React.MouseEvent<HTMLButtonElement>:
   * - React의 합성 이벤트(SyntheticEvent) 타입입니다.
   * - 브라우저 네이티브 MouseEvent를 React가 래핑한 것입니다.
   * - <HTMLButtonElement>: 이 이벤트가 발생한 요소가 HTMLButtonElement(<button>)임을 지정합니다.
   *
   * e.preventDefault():
   * - 링크 클릭 시 페이지 이동 같은 "기본 동작"을 막습니다.
   * - <button type="button">이지만 폼 안에 있을 수 있으므로 안전하게 호출합니다.
   *
   * e.stopPropagation():
   * - 이벤트 버블링을 막습니다.
   * - 부모 요소(<article> 카드)의 onClick이 실행되지 않도록 합니다.
   * - 찜 버튼 클릭 → 상세 페이지 이동이 동시에 일어나는 것을 방지합니다.
   *
   * onToggle(product): 부모(ProductCard)로부터 받은 콜백 함수를 호출합니다.
   * → 결국 useFavorites의 toggleFavorite(product)가 실행됩니다.
   * → 찜 추가 또는 제거가 처리됩니다.
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();   // 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 차단 (부모 카드 클릭 방지)
    onToggle(product);   // 찜 토글 실행
  };

  /**
   * JSX 반환 — 하트 버튼 UI
   *
   * className 동적 조합:
   * `${styles.favoriteButton} ${styles[size]} ${isFavorite ? styles.active : ''}`
   *
   * - styles.favoriteButton: 기본 버튼 스타일
   * - styles[size]: size 값에 따른 크기 스타일
   *   예: size = 'small' → styles.small CSS 클래스 적용
   *   → JavaScript 객체의 동적 키 접근: object[key]와 같은 원리
   * - isFavorite ? styles.active : '': 찜 상태이면 active 클래스 추가 (빨간 하트)
   *
   * aria-label: 스크린 리더 사용자를 위한 버튼 설명
   * - isFavorite에 따라 "찜 취소" 또는 "찜하기"로 표시됩니다.
   * - 아이콘만 있는 버튼에는 반드시 aria-label이 필요합니다.
   *
   * title: 마우스를 올리면(hover) 나타나는 툴팁 텍스트
   */
  return (
    <button
      className={`${styles.favoriteButton} ${styles[size]} ${
        isFavorite ? styles.active : ''
      }`}
      onClick={handleClick}
      aria-label={isFavorite ? '찜 취소' : '찜하기'}
      title={isFavorite ? '찜 취소' : '찜하기'}
      type="button"
    >
      {/**
       * SVG 하트 아이콘
       *
       * fill={isFavorite ? 'currentColor' : 'none'}:
       * - 찜 상태이면 currentColor(CSS color 속성 색상)로 채움 → 꽉 찬 하트
       * - 찜 안 한 상태이면 채우지 않음(none) → 빈 하트(윤곽만)
       *
       * stroke="currentColor": 하트의 테두리(stroke) 색상
       * strokeWidth="2": 테두리 두께
       *
       * <path d="M20.84 4.61...">:
       * - SVG 경로(path) 명령어로 하트 모양을 그립니다.
       * - M(이동), A(호), Z(닫기) 등의 명령어로 좌표를 이어 도형을 만듭니다.
       */}
      <svg
        className={styles.heartIcon}
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}

/**
 * export default: 기본 내보내기
 * 다른 파일에서: import FavoriteButton from './FavoriteButton'
 */
export default FavoriteButton;
